package com.xandyr.turborush

import android.webkit.JavascriptInterface

/** Exposed to the game as window.XandyrApp. Calls arrive on a background thread. */
class GameBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun getEntitlement(): String = activity.entitlementJson()

    /** Called after the grown-ups question in the game has been answered. */
    @JavascriptInterface
    fun subscribe() = activity.runOnUiThread { activity.startPurchase() }

    @JavascriptInterface
    fun restore() = activity.runOnUiThread { activity.billing.refreshPurchases() }
}
