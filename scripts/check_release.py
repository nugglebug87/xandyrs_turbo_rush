#!/usr/bin/env python3
"""Static release checks. Run: python3 scripts/check_release.py"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return (ROOT / path).read_text(encoding="utf-8")

def check():
    gradle = read("app/build.gradle.kts")
    billing = read("app/src/main/java/com/xandyr/turborush/BillingManager.kt")
    listing = read("store/LISTING.md")
    readme = read("README.md")
    errors = []
    def require(ok, message):
        if not ok:
            errors.append(message)
    require('billing:9.1.0' in gradle, "Expected Billing 9.1.0 dependency")
    require('PRODUCT_ID = "turbo_pass"' in billing, "Subscription ID mismatch")
    require('it.offerId == null' in billing and '?: offers.firstOrNull()' not in billing,
            "Purchase flow must not fall back to promotional offers")
    require("auto-renewing paid subscription" in listing, "Store listing must describe paid subscription")
    require("8 worlds" in listing, "Store listing must describe eight worlds")
    require("without trial offers" in readme, "README must describe paid base plan")
    activity = read("app/src/main/java/com/xandyr/turborush/MainActivity.kt")
    game = read("app/src/main/assets/game/index.html")
    require("trialEndsAt" not in activity and "TRIAL_MS" not in activity, "Remove native trial entitlement")
    require("trialEndsAt" not in game and "Free trial" not in game, "Remove game trial countdown")
    require("versionCode = 2" in gradle,
            "Expected versionCode 2; update release checklist for a new version")
    require("through 6 worlds" not in listing.lower(), "Outdated six-world wording")
    require("4-six-worlds.png" not in listing, "Replace outdated six-world screenshot reference")
    for error in errors:
        print("FAIL:", error)
    if errors:
        return 1
    print("Static release consistency checks passed (not a build or billing integration test).")
    return 0

if __name__ == "__main__":
    sys.exit(check())
