package ir.kelasam.app;

import android.os.Bundle;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // اگر پردازه‌ی نمایش (WebView) به‌خاطر کمبود حافظه از بین برود، کاپاسیتور به‌طور پیش‌فرض کل برنامه را می‌بندد؛
        // اینجا فقط صفحه دوباره ساخته می‌شود (اطلاعات روی حافظه ذخیره است و از دست نمی‌رود).
        try {
            getBridge().addWebViewListener(new WebViewListener() {
                @Override
                public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            recreate();
                        }
                    });
                    return true;
                }
            });
        } catch (Throwable ignored) {
        }
    }
}
