# Publishing on Google Play: step by step

Everything in Play Console has to be done signed in as you. This page lists each step in order, with the
answers to paste or pick. Store text and images are in [`LISTING.md`](LISTING.md) and this folder.

You'll need:

- `app-release.aab`, the signed release build
- `upload.jks` and `keystore.properties`, the upload key and its passwords. Keep these somewhere safe, like a
  password manager. **Never put them in GitHub.**

## 1. Create your developer account (one time)

1. Go to <https://play.google.com/console/signup> and sign in with the Google account you want to own the app.
2. Choose **Yourself** (a personal account) unless UnFiltered Ink is a registered business with a D-U-N-S number.
3. Pay the one-time **$25** fee and complete identity verification. This can take a few days.
4. Because the app sells a subscription, set up a **payments profile** when asked (*Setup > Payments profile*).
   Google shows your name and address publicly for apps that sell things.

> New personal accounts must run a **closed test with at least 12 testers for 14 days** before the app can go
> to production. Friends and family with Android phones work. Step 7 covers this.

## 2. Create the app

*Home > Create app*

| Field | Answer |
|---|---|
| App name | Xandyr's Turbo Rush |
| Default language | English (United States) |
| App or game | Game |
| Free or paid | Free (the subscription is an in-app purchase) |
| Declarations | Tick both (Developer Program Policies, US export laws) |

## 3. Upload the first build (internal testing)

*Test and release > Testing > Internal testing > Create new release*

1. When asked about app signing, choose **Use Google-generated key** (Play App Signing). Your file
   `upload-key.jks` is the *upload* key, so if it's ever lost, Google support can reset it.
2. Upload `app-release.aab`.
3. Release name: `1.1 (2)`. Release notes: `Toddler mode, Sky and Water zones, new vehicles and horns.`
4. *Testers* tab: create an email list with your own Google account (and anyone helping test).
5. Save, review, and **Start rollout to Internal testing**. Open the opt-in link on your phone to install.

## 4. Create the subscription

*Monetize with Play > Products > Subscriptions > Create subscription*

| Field | Answer |
|---|---|
| Product ID | `turbo_pass` (must be exactly this) |
| Name | Turbo Pass |
| Benefits (up to 4) | All 8 environments · Rockets and Turbo boost · Extra vehicles and 10 colors |

Then **Add base plan**:

| Field | Answer |
|---|---|
| Base plan ID | `monthly` |
| Type | Auto-renewing |
| Billing period | Monthly |
| Grace period | 7 days (default is fine) |
| Price | Your choice, e.g. $2.99. Play converts it for other countries |

**Activate** the base plan. **Don't add an offer or free trial**: the app provides a 24-hour free-access preview without enrolling users in a subscription
(Play's own trials must be at least 3 days).

## 5. License testing (free test purchases)

*Setup (Settings) > License testing*: add your Google account. Purchases from it are free and renew every few
minutes, so you can watch the subscription renew and then end.

On your phone, try: the free trial bar, buying Turbo Pass (answer the math question, then Google Play opens),
**Restore**, and cancelling in Google Play.

## 6. App content (*Policy and programs > App content*)

### Privacy policy
`https://github.com/nugglebug87/xandyrs_turbo_rush/blob/main/PRIVACY.md`
(the repository must stay **public** for this link to work).

### Ads
**No**, my app does not contain ads.

### App access
**All functionality is available without any special access.** (No login. Reviewers get the 24-hour trial.)

### Content rating (IARC questionnaire)
- Email: nugglebug87@gmail.com
- Category: **Game**
- Violence: **Yes**, cartoon or fantasy violence only. Vehicles are hit by cartoon rockets and spin around;
  no people, injuries, blood or destruction. Not realistic.
- Fear, sexuality, language, drugs, alcohol, tobacco, gambling, crude humor: **No**
- Users can interact or exchange content: **No**
- Shares user location: **No**
- Allows purchases of digital goods: **Yes**
- Unrestricted internet access: **No**

Expect a rating like *Everyone* (ESRB) / *PEGI 3* or *PEGI 7*.

### Target audience and content
- Target age groups: **Ages 5 and under** and **Ages 6–8**
- Appeal to children: the app is designed for children, so it joins the **Families program**.
- Teacher Approved: optional; you can skip it.

### Data safety
- Does your app collect or share any of the required user data types? **No**
  (Game progress stays on the device; payments are handled by Google Play, not by the app.)
- Is all of the user data collected by your app encrypted in transit? Not applicable when nothing is collected.
- Do you provide a way for users to request that their data is deleted? Not applicable: no data or accounts.
  Uninstalling removes local data, subject to Android backup/restore settings.

### Other declarations
| Declaration | Answer |
|---|---|
| Government app | No |
| Financial features | None |
| Health apps | No |
| News app | No |
| Advertising ID | No (the app doesn't use it) |

## 7. Closed test (new personal accounts)

*Test and release > Testing > Closed testing > Create track*

1. Upload the same `app-release.aab` (or promote it from internal testing).
2. Add **at least 12 testers** (Google accounts) and keep them opted in for **14 days**.
3. Then *Dashboard > Apply for production* and answer Google's short questions about the test.

## 8. Store listing and countries

- *Grow users > Store presence > Main store listing*: paste from [`LISTING.md`](LISTING.md) and upload the images.
- *Test and release > Production > Countries/regions*: pick where to sell (e.g. United States).

## Pre-submission verification gates

- Confirm the Play listing and screenshots show eight environments and clearly distinguish premium features.
- Test purchase, restore, expiration, cancellation, grace period, account hold, refund and pending purchase behavior using a Play-installed build.
- Verify the final merged manifest, bundled SDKs, network requests, and Data Safety answers; do not assume that billing means no data handling.
- Validate the parent gate on actual child-facing devices and ensure a guardian can see the localized price and renewal period before purchase.
- Confirm release signing, the actual bundled game asset, versionCode 2, and current Play Console target API requirements.
- Treat the app-managed 24-hour preview as device-clock-dependent; test clock changes, clearing storage, and backup restore.
- Do not submit to production until subscription lifecycle tests and privacy verification pass.

## 9. Release to production

*Test and release > Production > Create new release*, add the build, then **Send for review**. Kids' apps get
a closer review; it usually takes a few days.

## For each update later

1. Change the game in `web/turbo-rush.html`, then `scripts/sync-game.sh web/turbo-rush.html`.
2. Raise `versionCode` (2, 3, …) and `versionName` in `app/build.gradle.kts`.
3. `./gradlew bundleRelease` with `keystore.properties` and `upload-key.jks` next to the README.
4. Upload the new `app/build/outputs/bundle/release/app-release.aab`.
