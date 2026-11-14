# Release verification checklist (version 1.1 / code 2)

This branch corrects listing counts, the removal of app-managed preview access, privacy wording, Play Console release instructions, and one billing failure behavior. It does **not** establish that the release is production ready.

## Verified on PR #1
- [x] No app-managed trial in gameplay or Android entitlement; paid base plan selection only.
- [x] Listing, privacy text, release instructions and promotional source updated for no trial.
- [x] Eight screenshots and feature graphic regenerated from the updated source with creator credit.
- [x] Static checks and Android debug build, unit test task and unsigned release bundle passed in GitHub Actions run 43653969955.
- [x] PR conflict with current `main` resolved.

## Blocking verification
- [ ] Confirm Google Play subscription `turbo_pass` monthly base plan is active and localized price is visible before purchase.
- [ ] Test active, pending, restored, expired, refunded, grace-period, account-hold and canceled subscription states in a Play-installed build.
- [ ] Review the fail-closed billing refresh behavior for offline paid users; define a bounded offline entitlement policy before shipping.
- [ ] Add backend verification and a subscription lifecycle source of truth if robust entitlement enforcement is required.
- [ ] Confirm no trial or introductory offer is active on the Play Console `turbo_pass` base plan; free content remains available.
- [ ] Review child-facing purchase gate against current Google Play Families policy.
- [ ] Inspect merged manifest, SDK dependencies and actual network traffic before final Data Safety declarations.
- [x] Inspect all eight current screenshots visually and ensure premium claims are qualified in the listing.
- [ ] Check asset sync from `web/turbo-rush.html` to `app/src/main/assets/game/index.html`; test toddler, Sky and Water modes in the signed build.
- [ ] Verify release signing, versionCode 2, Play Console configuration, and closed-testing requirements.

The CI debug build, unit test task and unsigned release bundle passed. Release signing and Play-installed device tests have not been verified.