# The game calls these from JavaScript; keep their names.
-keepclassmembers class com.xandyr.turborush.GameBridge {
    @android.webkit.JavascriptInterface <methods>;
}
