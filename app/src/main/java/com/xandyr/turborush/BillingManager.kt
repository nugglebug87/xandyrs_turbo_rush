package com.xandyr.turborush

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClient.BillingResponseCode
import com.android.billingclient.api.BillingClient.ProductType
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams

/**
 * Google Play Billing for the "Turbo Pass" subscription.
 *
 * The 24-hour free-access preview is handled by the app (see MainActivity).
 * It does not enroll the user in a Google Play subscription. Configure a paid base plan.
 */
class BillingManager(context: Context, private val onChange: () -> Unit) : PurchasesUpdatedListener {

    companion object {
        /** Must match the subscription's product ID in Play Console. */
        const val PRODUCT_ID = "turbo_pass"
    }

    private val client = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .build()

    @Volatile var subscribed = false
        private set
    @Volatile var price = ""
        private set
    @Volatile var ready = false
        private set
    private var details: ProductDetails? = null

    fun start() {
        if (client.isReady || client.connectionState == BillingClient.ConnectionState.CONNECTING) return
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                ready = result.responseCode == BillingResponseCode.OK
                if (ready) {
                    queryProduct()
                    refreshPurchases()
                }
                onChange()
            }

            // The client reconnects by itself (enableAutoServiceReconnection).
            override fun onBillingServiceDisconnected() {
                ready = false
            }
        })
    }

    fun end() = client.endConnection()

    private fun queryProduct() {
        val product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(PRODUCT_ID)
            .setProductType(ProductType.SUBS)
            .build()
        val params = QueryProductDetailsParams.newBuilder().setProductList(listOf(product)).build()
        client.queryProductDetailsAsync(params) { result, found ->
            if (result.responseCode == BillingResponseCode.OK) {
                details = found.productDetailsList.firstOrNull { it.productId == PRODUCT_ID }
                price = basePlan()?.pricingPhases?.pricingPhaseList?.lastOrNull()
                    ?.let { "${it.formattedPrice} / ${periodLabel(it.billingPeriod)}" } ?: ""
            }
            onChange()
        }
    }

    /** Select the paid base plan (no offer ID), never a promotional offer. */
    private fun basePlan(): ProductDetails.SubscriptionOfferDetails? {
        val offers = details?.subscriptionOfferDetails ?: return null
        return offers.firstOrNull { it.offerId == null }
    }

    /** Restores an existing subscription and notices one that has ended. */
    fun refreshPurchases() {
        if (!client.isReady) return start()
        val params = QueryPurchasesParams.newBuilder().setProductType(ProductType.SUBS).build()
        client.queryPurchasesAsync(params) { result, purchases ->
            if (result.responseCode == BillingResponseCode.OK) {
                subscribed = handle(purchases)
            }
            // A transient Play outage does not prove that an existing subscription expired.
            // Keep the last confirmed state until Play returns an authoritative result.
            onChange()
        }
    }

    /** Opens Google Play's purchase sheet. Returns false if Play isn't ready yet. */
    fun launch(activity: Activity): Boolean {
        val product = details ?: return false
        val offer = basePlan() ?: return false
        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(
                listOf(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(product)
                        .setOfferToken(offer.offerToken)
                        .build()
                )
            )
            .build()
        return client.launchBillingFlow(activity, params).responseCode == BillingResponseCode.OK
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        when (result.responseCode) {
            BillingResponseCode.OK -> if (purchases != null && handle(purchases)) subscribed = true
            BillingResponseCode.ITEM_ALREADY_OWNED -> return refreshPurchases()
            else -> Unit // Cancelled or failed: keep current entitlement until next refresh.
        }
        onChange()
    }

    /** Acknowledges new purchases (Play refunds unacknowledged ones after 3 days). True if one is active. */
    private fun handle(purchases: List<Purchase>): Boolean {
        var active = false
        for (p in purchases) {
            // A suspended subscription (payment problem) doesn't unlock anything.
            if (PRODUCT_ID !in p.products || p.purchaseState != Purchase.PurchaseState.PURCHASED || p.isSuspended) continue
            active = true
            if (!p.isAcknowledged) {
                val ack = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.purchaseToken).build()
                client.acknowledgePurchase(ack) { }
            }
        }
        return active
    }

    private fun periodLabel(iso: String) = when (iso) {
        "P1W" -> "week"
        "P1M" -> "month"
        "P3M" -> "3 months"
        "P6M" -> "6 months"
        "P1Y" -> "year"
        else -> iso
    }
}
