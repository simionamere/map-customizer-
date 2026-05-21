package com.act.map;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.animation.OvershootInterpolator;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ImageView icon = findViewById(R.id.splash_icon);

        // ── Set icon width to 45% of screen width ────────────────
        DisplayMetrics dm = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(dm);
        int iconSize = (int) (dm.widthPixels * 0.45f);

        RelativeLayout.LayoutParams params =
            new RelativeLayout.LayoutParams(iconSize, iconSize);
        params.addRule(RelativeLayout.CENTER_IN_PARENT);
        icon.setLayoutParams(params);

        // ── Animate: scale 0.8 → 1.0 + fade 0 → 1 ───────────────
        icon.setScaleX(0.8f);
        icon.setScaleY(0.8f);
        icon.setAlpha(0f);

        ObjectAnimator scaleX  = ObjectAnimator.ofFloat(icon, View.SCALE_X, 0.8f, 1.0f);
        ObjectAnimator scaleY  = ObjectAnimator.ofFloat(icon, View.SCALE_Y, 0.8f, 1.0f);
        ObjectAnimator fadeIn  = ObjectAnimator.ofFloat(icon, View.ALPHA,   0f,   1.0f);

        OvershootInterpolator overshoot = new OvershootInterpolator(1.5f);
        scaleX.setInterpolator(overshoot);
        scaleY.setInterpolator(overshoot);

        AnimatorSet set = new AnimatorSet();
        set.playTogether(scaleX, scaleY, fadeIn);
        set.setDuration(650);
        set.start();

        // ── Launch main activity after splash ─────────────────────
        icon.postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            finish();
        }, 1400);
    }
}
