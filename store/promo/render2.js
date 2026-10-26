// Renders raw frames for the v1.1 store posters from the app's bundled game (offline fonts).
// Usage: node render2.js <app/src/main/assets/game> [only-prefix]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const game = process.argv[2], only = process.argv[3], out = path.join(__dirname, 'frames2');
require('fs').mkdirSync(out, { recursive: true });
const zoneOf = t => t === 'sky' ? 'air' : t === 'water' ? 'water' : 'road';
async function open(b, w, h, save) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.addInitScript(save => {
    localStorage.setItem('hairpin-rush-v1', JSON.stringify(save));
    window.XandyrApp = { getEntitlement: () => JSON.stringify({ subscribed: true, trialEndsAt: 0, price: '', billingReady: true }), subscribe() {}, restore() {} };
  }, save);
  await p.route('**/*', r => {
    const u = new URL(r.request().url());
    if (u.host !== 'appassets.androidplatform.net') return r.abort();
    return r.fulfill({ path: path.join(game, u.pathname.replace('/assets/game/', '')) });
  });
  await p.goto('https://appassets.androidplatform.net/assets/game/index.html');
  await p.waitForTimeout(1200);
  return p;
}
const saveFor = (mode, track, style, color) => ({ mode, track, level: 3, carColor: color || '#ff4d3d', mute: true, pick: { [`${mode}-${zoneOf(track)}`]: style } });
// Freeze a moment and aim an orbit camera at the focus vehicle (az 0 = in front, 180 = behind).
const aim = (o) => {
  const G = window.__game;
  G.paused = true; G.hideUi();
  const target = o.focus === 'hit' ? G.ais.find(a => a.spinT > 0).car : G.player.car;
  const c = target.root.position.clone(), h = G.player.car.body.rotation.y;
  const az = h + (o.az || 0) * Math.PI / 180, el = (o.el || 8) * Math.PI / 180, dist = o.dist || 13;
  const cam = G.camera;
  cam.position.set(c.x + Math.sin(az) * Math.cos(el) * dist, c.y + 0.8 + Math.sin(el) * dist, c.z + Math.cos(az) * Math.cos(el) * dist);
  cam.fov = o.fov || 50; cam.updateProjectionMatrix();
  const look = c.clone().add(new THREE.Vector3(0, o.lookUp ?? 1.2, 0));
  cam.lookAt(look);
  if (o.shiftX) { cam.updateMatrixWorld(); cam.lookAt(look.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), o.shiftX)); }
  G.cars.forEach(car => { if (car !== target && car.root.position.distanceTo(cam.position) < (o.clearR || 8)) car.root.visible = false; });
  G.scene.traverse(m => { if (m.isMesh && m.geometry.parameters && m.geometry.parameters.radiusTop === 0.75 && m.position.distanceTo(cam.position) < 22) m.visible = false; });
  if (o.noFlames) G.cars.forEach(car => car.flames.forEach(f => { f.visible = false; }));
};
async function shoot(p, file, o) {
  await p.click(o.mode === 'kids' ? '#startBtn' : '#tGo', { force: true });
  await p.evaluate(o => {
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
  }, o);
  await p.evaluate(aim, o);
  await p.waitForTimeout(450);
  await p.screenshot({ path: path.join(out, file) });
}
const SHOTS = [
  // file, w, h, mode, track, style, colour, options
  ['split-toddler.png', 540, 480, 'toddler', 'meadow', 'police', null, { steps: 260, az: 28, el: 7, dist: 9, fov: 44, lookUp: 1.4 }],
  ['split-kids.png', 540, 480, 'kids', 'city', 'gt', '#ff4d3d', { steps: 330, turboAt: 300, az: 150, el: 9, dist: 11, fov: 50, lookUp: 2.0 }],
  ['sky-jet.png', 540, 960, 'kids', 'sky', 'jet', '#2f7bff', { steps: 300, turboAt: 270, az: 155, el: 13, dist: 15, fov: 52, lookUp: 2.6 }],
  ['sky-plane.png', 540, 960, 'toddler', 'sky', 'plane', null, { steps: 360, az: 40, el: 6, dist: 12, fov: 50, lookUp: 2.4 }],
  ['water-boat.png', 540, 960, 'kids', 'water', 'boat', '#ff4d3d', { steps: 330, turboAt: 300, az: 145, el: 11, dist: 13, fov: 52, lookUp: 2.2 }],
  ['toddler-fire.png', 540, 960, 'toddler', 'city', 'fire', null, { steps: 300, az: 32, el: 7, dist: 13, fov: 50, lookUp: 2.4 }],
  ['toddler-bus.png', 540, 960, 'toddler', 'beach', 'bus', null, { steps: 360, az: 40, el: 9, dist: 13, fov: 50, lookUp: 2.4 }],
  ['feature-sky.png', 1024, 500, 'kids', 'sky', 'jet', '#ff4d3d', { steps: 330, turboAt: 300, az: 150, el: 9, dist: 14, fov: 36, lookUp: 2.0, shiftX: -5.5, clearR: 18 }],
];
const RIDES = [
  ['kids', 'meadow', 'gt', '#ff4d3d'], ['kids', 'meadow', 'super', '#37d4ff'], ['kids', 'meadow', 'muscle', '#ffc93c'], ['kids', 'meadow', 'rally', '#ff6fb5'],
  ['kids', 'meadow', 'truck', '#2f7bff'], ['kids', 'meadow', 'dump', '#ffc93c'], ['kids', 'meadow', 'semi', '#ff4d3d'], ['kids', 'meadow', 'formula', '#2fbf5b'],
  ['toddler', 'meadow', 'bubble'], ['toddler', 'meadow', 'police'], ['toddler', 'meadow', 'fire'], ['toddler', 'meadow', 'bus'],
  ['toddler', 'meadow', 'icecream'], ['toddler', 'meadow', 'tractor'], ['toddler', 'sky', 'plane'], ['toddler', 'sky', 'heli'],
  ['toddler', 'sky', 'jet'], ['toddler', 'sky', 'ufo'], ['toddler', 'water', 'boat'], ['toddler', 'water', 'jetski'],
];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [file, w, h, mode, track, style, color, o] of SHOTS) {
    if (only && !file.startsWith(only)) continue;
    const p = await open(b, w, h, saveFor(mode, track, style, color));
    await shoot(p, file, { ...o, mode });
    if (p.errs.length) console.log(file, p.errs);
    await p.close();
  }
  if (!only || only === 'ride') {
    for (const [mode, track, style, color] of RIDES) {
      const p = await open(b, 270, 270, saveFor(mode, track, style, color));
      const big = { semi: 1.5, ufo: 1.25, bus: 1.15, heli: 1.1 }[style] || 1;
      await p.evaluate(aim, { az: 38, el: 13, dist: 10.5 * big, fov: 40, lookUp: style === 'icecream' ? 1.6 : 1.0, noFlames: true });
      await p.waitForTimeout(350);
      await p.screenshot({ path: path.join(out, `ride-${style}.png`) });
      if (p.errs.length) console.log(style, p.errs);
      await p.close();
    }
  }
  await b.close();
})();
