# Xandyr's Turbo Rush (Android)

A vehicle racing game for little kids ages 2-7: a 3D racer packaged as an Android app with a
Google Play subscription called **Turbo Pass** and a **24-hour free-access preview**.

The game is a single HTML page (three.js) bundled in `app/src/main/assets/game/` and shown full screen in a
WebView. The game is fully offline: no ads, no analytics, no web requests. (The Google Play Billing library
adds its own INTERNET and network-state permissions to talk to Google Play.)

## What's free and what's in Turbo Pass

The game opens on a **"Who's driving?"** screen:

- **Toddlers (2–4):** the car drives itself and always stays on the road; touching the screen makes it go
  faster, so little ones can press HONK or ROCKET without also having to steer or hold. Big picture buttons,
  bright vehicles with cartoon eyes (Bubble car, Police car and Fire truck with flashing lights, School bus,
  Ice cream truck, Tractor) and a "YAY!" finish.
- **Little kids (4–7):** the original game: hold to go, upgrades, coins, and eight cars and trucks including a
  Dump truck and a Semi.

Every vehicle has its own horn (sirens, air horns, a bulb horn, a foghorn, an ice cream jingle, a UFO warble...).

| | Free (after the preview) | With the preview or Turbo Pass |
|---|---|---|
| Tracks | Meadow | Meadow, Desert, Snow, Beach, City, Space, **Sky Zone**, **Water Zone** |
| Sky Zone | No | Plane, Helicopter, Jet, UFO on a rainbow sky road |
| Water Zone | No | Speedboat, Jet Ski on a river |
| Rockets and Turbo | No (buttons hidden) | Yes |
| Vehicles | Sports car (little kids), Bubble car (toddlers) | All of them |
| Paint | Yellow | All 10 colors |
| Levels, coins, upgrades, honk | Yes | Yes |

When the preview ends, locked items show a padlock. Tapping one opens the Turbo Pass screen. Buying goes
through a **grown-ups-only times-table question** first, then Google Play's own purchase sheet.

## How the 24-hour trial works

Google Play only allows free-trial offers of **3 days or longer**, so a 24-hour trial can't be set up
in Play Console. The app runs the preview itself instead:

- The preview starts the first time the app is opened (`first_open` in `SharedPreferences`, file `turbo_pass`).
- The backup configuration includes the timestamp, but restore is device- and backup-dependent; reinstalling may restart the preview.
- Clearing the app's storage in Settings would restart it. For a stricter trial you'd need a server that
  remembers each account.

So in Play Console the subscription should have **no free-trial offer**, just a paid base plan.

## Code map

| File | What it does |
|---|---|
| `MainActivity.kt` | Full-screen WebView, loads the game from assets, keeps the preview clock, talks to the game |
| `BillingManager.kt` | Google Play Billing 9: product lookup, purchase sheet, acknowledging, restoring, renewals |
| `GameBridge.kt` | `window.XandyrApp` in JavaScript: `getEntitlement()`, `subscribe()`, `restore()` |
| `assets/game/index.html` | The game. It locks content only when `window.XandyrApp` exists |
| `scripts/sync-game.sh` | Copies a new version of the game page into the app and strips internet links |

The game asks `XandyrApp.getEntitlement()` for `{ subscribed, trialEndsAt, price, billingReady }`, and the
app pushes changes back by calling `window.onEntitlement(json)`.

## Set up Google Play (one time)

1. **Developer account**: sign up at <https://play.google.com/console> (one-time $25 fee). Set up a
   payments profile so you can sell subscriptions.
2. **Create the app** in Play Console with the package name `com.xandyr.turborush`.
3. **Upload a first build** to the *Internal testing* track (Play only shows the subscription settings once
   a build with the billing library has been uploaded). See *Build* below.
4. **Create the subscription**: *Monetize > Products > Subscriptions > Create subscription*
   - Product ID: **`turbo_pass`** (must match `BillingManager.PRODUCT_ID`)
   - Name: Turbo Pass
   - Add a **base plan**, auto-renewing, monthly (or weekly or yearly). Set the price, e.g. $2.99.
   - **Don't add a free-trial offer**; the app gives the 24-hour trial.
   - Activate the base plan.
5. **Test buyers**: *Settings > License testing*, add your Google account. Test purchases from those accounts
   are free and renew every few minutes, so you can watch a renewal and an expiry quickly.
6. Install the app from the internal testing link on your phone and try the preview, the Turbo Pass screen,
   buying, cancelling and *Restore*.

### Kids' app rules (Google Play Families policy)

Because the game is made for young children, Play Console will ask about it:

- **Target audience and content**: choose the age groups (e.g. 5 and under, 6–8). This puts the app under
  the Families policy.
- **Privacy policy URL**: required for kids' apps even if you collect nothing. Say that the app collects no
  personal data, has no ads or analytics, and that purchases are handled by Google Play.
- **Data safety form**: the app itself collects and shares no data. Google Play Billing handles payments.
- **Purchases**: Families policy asks that in-app purchases are aimed at the parent. The app uses a math question before Google Play opens; review whether this is a sufficient parent gate under current Families policy. Google Play account authentication varies by configuration.
- **Content rating questionnaire**: cartoon racing, rockets that make cars spin out (no damage or injury).

## Build

Needs JDK 17+ and the Android SDK (Android Studio installs both). Open the folder in Android Studio, or:

```sh
./gradlew assembleDebug        # app/build/outputs/apk/debug/app-debug.apk, to sideload for a quick look
./gradlew bundleRelease        # app/build/outputs/bundle/release/app-release.aab, to upload to Play
```

Billing only works in a build installed **from Google Play** (internal testing is fine). A sideloaded debug
APK runs the game and the preview, but the Turbo Pass screen will say Google Play isn't ready.

### Signing the release

Create an upload key once and keep it safe (if you lose it, Play support can reset it, but it's slow):

```sh
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Then create `keystore.properties` next to this README (it's in `.gitignore`):

```properties
storeFile=upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

Turn on **Play App Signing** when you upload the first bundle.

### Before each release

Bump `versionCode` (and `versionName`) in `app/build.gradle.kts`.

## Updating the game

The game's source is a single HTML file, `web/turbo-rush.html` (the same page as the web version).
After changing it, bring it into the app:

```sh
scripts/sync-game.sh web/turbo-rush.html
./gradlew bundleRelease
```

The script swaps the three.js CDN link for the bundled copy, removes the Google Fonts links (the fonts are
bundled in `assets/game/fonts`, OFL licensed), and refuses to write a page that still loads anything from
the internet.

## Licenses

- three.js r128: MIT
- Racing Sans One, Russo One, Barlow: SIL Open Font License (texts in `assets/game/fonts`)
