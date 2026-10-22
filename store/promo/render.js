// Renders cinematic raw frames from the app's bundled game for the Play Store posters.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const game = process.argv[2], out = path.join(__dirname, 'frames');
require('fs').mkdirSync(out, { recursive: true });
const subscribed = () => { window.XandyrApp = { getEntitlement: () => JSON.stringify({ subscribed: true, trialEndsAt: 0, price: '', billingReady: true }), subscribe() {}, restore() {} }; };
async function open(b, w, h) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.addInitScript(subscribed);
  await p.route('**/*', r => {
    const u = new URL(r.request().url());
    if (u.host !== 'appassets.androidplatform.net') return r.abort();
    return r.fulfill({ path: path.join(game, u.pathname.replace('/assets/game/', '')) });
  });
  await p.goto('https://appassets.androidplatform.net/assets/game/index.html');
  await p.waitForTimeout(1200);
  return p;
}
async function pick(p, track, style, paint) {
  await p.click('#track-' + track); await p.click('#style-' + style); await p.click('#paint-' + paint);
}
// Sim to a moment, freeze, then aim the camera relative to the player's car.
async function shoot(p, file, o) {
  await p.click('#startBtn');
  await p.evaluate(async o => {
    const G = window.__game;
    for (let i = 0; i < 200; i++) G.step(1 / 60);
    G.setThrottle(true);
    let hitAt = -1;
    for (let i = 0; i < (o.steps || 300); i++) {
      if (o.turboAt === i) G.fireTurbo();
      if (o.rocketAt === i) G.fireRocket();
      G.step(1 / 60);
      if (o.rocketAt != null && hitAt < 0 && G.ais.some(a => a.spinT > 0)) hitAt = i;
      if (hitAt >= 0 && i - hitAt >= (o.afterHit || 9)) break;
    }
    G.paused = true;
    G.hideUi();
    const target = o.focus === 'hit' ? G.ais.find(a => a.spinT > 0).car : G.player.car;
    const c = target.root.position.clone(), h = G.player.car.body.rotation.y;
    // Orbit camera: az 0 = in front of the car looking back at it, 180 = behind it.
    const az = h + (o.az || 0) * Math.PI / 180, el = (o.el || 8) * Math.PI / 180, dist = o.dist || 13;
    const cam = G.camera;
    cam.position.set(c.x + Math.sin(az) * Math.cos(el) * dist, c.y + 0.8 + Math.sin(el) * dist, c.z + Math.cos(az) * Math.cos(el) * dist);
    cam.fov = o.fov || 50; cam.updateProjectionMatrix();
    const look = c.clone().add(new THREE.Vector3(0, o.lookUp ?? 1.2, 0));
    cam.lookAt(look);
    if (o.shiftX) { // slide the car sideways in frame
      cam.updateMatrixWorld();
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
      cam.lookAt(look.addScaledVector(right, o.shiftX));
    }
    // Rival cars right in front of the lens would fill the frame: hide those.
    G.cars.forEach(car => { if (car !== target && car.root.position.distanceTo(cam.position) < 8) car.root.visible = false; });
    // Coins right in front of the lens read as big yellow blobs: hide the close ones.
    G.scene.traverse(m => {
      if (m.isMesh && m.geometry.parameters && m.geometry.parameters.radiusTop === 0.75 && m.position.distanceTo(cam.position) < 22) m.visible = false;
    });
  }, o);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(out, file) });
}
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const shots = [
    ['hero-meadow.png', 'meadow', 'gt', 'yellow', { steps: 330, turboAt: 300, az: 32, el: 7, dist: 13, fov: 50, lookUp: 2.2 }],
    ['space-turbo.png', 'space', 'super', 'sky-blue', { steps: 420, turboAt: 395, az: 160, el: 9, dist: 13, fov: 52, lookUp: 2.4 }],
    ['snow-bonk.png', 'snow', 'muscle', 'red', { steps: 260, rocketAt: 40, afterHit: 6, focus: 'hit', az: 205, el: 12, dist: 12, fov: 50, lookUp: 2.2 }],
    ['city-low.png', 'city', 'rally', 'pink', { steps: 360, az: -38, el: 3, dist: 12, fov: 62, lookUp: 4.2 }],
    ['desert-side.png', 'desert', 'truck', 'orange', { steps: 520, turboAt: 500, az: 40, el: 13, dist: 11, fov: 52, lookUp: 2.2 }],
    ['beach-aerial.png', 'beach', 'formula', 'green', { steps: 400, turboAt: 380, az: 150, el: 30, dist: 16, fov: 55, lookUp: 0 }],
  ];
  for (const [file, track, style, paint, o] of shots.filter(x => !process.env.ONLY || process.env.ONLY.split(',').includes(x[0]))) {
    const p = await open(b, 540, 960);
    await pick(p, track, style, paint);
    await shoot(p, file, o);
    if (p.errs.length) console.log(file, p.errs);
    await p.close();
  }
  // Car close-ups for the garage poster (menu scene, camera aimed by hand).
  const cars = process.env.ONLY ? [] : [['gt', 'red'], ['super', 'sky-blue'], ['muscle', 'yellow'], ['rally', 'pink'], ['truck', 'blue'], ['formula', 'green']];
  for (const [style, paint] of cars) {
    const p = await open(b, 540, 540);
    await pick(p, 'city', style, paint);
    await p.evaluate(() => {
      const G = window.__game; G.paused = true; G.hideUi();
      const c = G.player.car.root.position, h = G.player.car.body.rotation.y;
      const cam = G.camera;
      cam.position.set(c.x + Math.sin(h) * 6.2 + Math.cos(h) * 4.2, c.y + 1.7, c.z + Math.cos(h) * 6.2 - Math.sin(h) * 4.2);
      cam.fov = 40; cam.updateProjectionMatrix();
      cam.lookAt(c.x, c.y + 0.9, c.z);
    });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(out, `car-${style}.png`) });
    await p.close();
  }
  // Wide hero for the feature graphic.
  {
    const p = await open(b, 1024, 500);
    await pick(p, 'space', 'gt', 'red');
    await shoot(p, 'feature-raw.png', { steps: 380, turboAt: 350, az: 30, el: 6, dist: 12, fov: 34, lookUp: 1.6, shiftX: -5 });
    await p.close();
  }
  await b.close();
})();
