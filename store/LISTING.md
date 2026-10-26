# Google Play store listing

Copy these into **Play Console > Grow users > Store presence > Main store listing**.

## App name (max 30 characters)

Xandyr's Turbo Rush

## Short description (max 80 characters)

Hold to go! Race cars, honk, turbo and zoom through 6 worlds. For kids ages 2-7.

## Full description (max 4000 characters)

Zoom, honk and race! Xandyr's Turbo Rush is a bright 3D racing game made for little drivers ages 2 to 7.

TWO WAYS TO PLAY
• Toddlers (2–4): the car drives all by itself and never leaves the road. Tap to go faster!
• Little kids (4–7): hold to go, let go to slow down, earn coins and upgrade your ride.
• Friendly rival racers, start lights, confetti and fireworks at every finish line.

TODDLER VEHICLES WITH BIG CARTOON EYES
• Police car and fire truck with flashing lights and real sirens
• School bus, ice cream truck with an ice cream jingle, tractor and a bubble car

BIG BUTTONS, BIG FUN
• HONK the horn and watch cars move out of the way.
• TURBO boost with blue flames and speed lines.
• Cartoon ROCKETS make the other cars spin around with a "BONK!" and a burst of stars.

SKY ZONE AND WATER ZONE
• Fly a plane, helicopter, jet or UFO along a rainbow road through the clouds
• Race speedboats and jet skis down a river past lighthouses

SIX MORE WORLDS TO EXPLORE
• Meadow with pine trees
• Desert with cactus and rocks
• Snow with snowmen and falling snowflakes
• Beach with palm trees on a sandy island
• City with tall, colorful buildings
• Space with planets, stars and glowing crystals

BUILD YOUR DREAM CAR
• Sports, Super, Muscle, Rally, Pickup, Dump truck, Semi truck and Formula race car
• Every vehicle has its own horn: air horns, sirens, a foghorn, a UFO warble and more
• Ten paint colors
• Collect gold coins to upgrade the Engine, Turbo and Tires

MADE FOR KIDS AND PARENTS
• No ads
• No accounts, no chat and no data collection
• Works offline, great for car rides
• Grown-ups-only question before any purchase

TURBO PASS
Try everything free for 24 hours. After that, the Meadow track, the yellow sports car and the toddler bubble
car stay free forever. Turbo Pass unlocks the Sky Zone, the Water Zone, all other worlds, rockets and turbo,
and every vehicle and color. It's an auto-renewing
subscription billed through Google Play; cancel any time in Google Play under Payments & subscriptions.

## Category and tags

- App or game: **Game**
- Category: **Racing**
- Tags (pick up to 5): Racing, Casual, Kids, Cars, Offline

## Contact details

- Email: nugglebug87@gmail.com
- Privacy policy: https://github.com/nugglebug87/xandyrs_turbo_rush/blob/main/PRIVACY.md

## Graphics (in this folder)

| Play Console field | File |
|---|---|
| App icon (512×512) | `icon-512.png` |
| Feature graphic (1024×500) | `feature-graphic.png` |
| Phone screenshots (1080×1920), in this order | `screenshots/1-toddlers-and-kids.png`, `2-fly-the-sky.png`, `3-make-a-splash.png`, `4-wee-woo.png`, `5-bonk-rockets.png`, `6-twenty-rides.png`, `7-eight-worlds.png`, `8-made-for-kids.png` |

The first three screenshots are what most people see in search results, so they lead with the two ways
to play (toddlers and little kids) and the two new zones (sky and water).

To regenerate the art after changing the game (from the repository root):

```sh
node store/promo/render.js app/src/main/assets/game    # older frames: meadow, desert, snow, beach, city, space, rockets
node store/promo/render2.js app/src/main/assets/game   # v1.1 frames: toddler vehicles, sky, water, all 20 rides
node store/promo/compose2.js store                     # builds store/screenshots and store/feature-graphic.png
```
