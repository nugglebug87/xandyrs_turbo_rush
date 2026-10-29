package com.xandyr.turborush

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    companion object {
        private const val GAME_HOST = "appassets.androidplatform.net"
        private const val GAME_URL = "https://$GAME_HOST/assets/game/index.html"
    }

    lateinit var billing: BillingManager
        private set
    private lateinit var web: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        goFullScreen()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Billing first: the game asks for the entitlement as soon as it loads.
        billing = BillingManager(this) { pushEntitlement() }
        billing.start()

        val assets = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true // saves coins, level and car choices
            settings.mediaPlaybackRequiresUserGesture = true
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            setBackgroundColor(0xFF9AD8FF.toInt())
            webViewClient = object : WebViewClientCompat() {
                override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                    assets.shouldInterceptRequest(request.url)

                // The game never navigates; keep the child inside it.
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                    request.url.host != GAME_HOST
            }
            addJavascriptInterface(GameBridge(this@MainActivity), "XandyrApp")
        }
        setContentView(web)
        web.loadUrl(GAME_URL)
    }

    override fun onResume() {
        super.onResume()
        goFullScreen()
        web.onResume()
        billing.refreshPurchases() // notices renewals, cancellations and purchases made elsewhere
    }

    override fun onPause() {
        web.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        billing.end()
        web.destroy()
        super.onDestroy()
    }

    fun entitlementJson(): String {
        return JSONObject()
            .put("subscribed", billing.subscribed)
            .put("price", billing.price)
            .put("billingReady", billing.ready)
            .toString()
    }

    fun startPurchase() {
        if (!billing.launch(this)) {
            billing.start()
            sendToGame("onPassMessage", "Google Play isn't ready yet. Check the internet connection and try again.")
        }
    }

    private fun pushEntitlement() = sendToGame("onEntitlement", entitlementJson())

    private fun sendToGame(fn: String, arg: String) = runOnUiThread {
        if (::web.isInitialized) {
            web.evaluateJavascript("window.$fn && window.$fn(${JSONObject.quote(arg)})", null)
        }
    }

    private fun goFullScreen() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }
}
