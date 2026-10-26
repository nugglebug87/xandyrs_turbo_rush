# Release verification checklist (version 1.1 / code 2)

This branch corrects listing counts, the app-managed 24-hour preview description, privacy wording, Play Console release instructions, and one billing failure behavior. It does **not** establish that the release is production ready.

## Blocking verification
- [ ] Confirm Google Play subscription `turbo_pass` monthly base plan is active and localized price is visible before purchase.
- [ ] Test active, pending, restored, expired, refunded, grace-period, account-hold and canceled subscription states in a Play-installed build.
- [ ] Review the fail-closed billing refresh behavior for offline paid users; define a bounded offline entitlement policy before shipping.
- [ ] Add backend verification and a subscription lifecycle source of truth if robust entitlement enforcement is required.
- [ ] Confirm the 24-hour preview is not marketed as an automatic Google Play trial; evaluate clock manipulation and data-clearing resets.
- [ ] Review child-facing purchase gate against current Google Play Families policy.
- [ ] Inspect merged manifest, SDK dependencies and actual network traffic before final Data Safety declarations.
- [ ] Replace the stale six-world screenshot with a current eight-environment poster. Inspect all seven screenshots visually and ensure premium claims are qualified.
- [ ] Check asset sync from `web/turbo-rush.html` to `app/src/main/assets/game/index.html`; test toddler, Sky and Water modes in the signed build.
- [ ] Verify release signing, versionCode 2, Play Console configuration, and closed-testing requirements.

No builds or device tests have been run as part of this change.