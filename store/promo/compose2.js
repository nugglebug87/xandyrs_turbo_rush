// Builds the v1.1 store posters into <store>/screenshots and <store>/feature-graphic.png.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const out = process.argv[2]; // the store/ folder
(async () => {
  const b = await chromium.launch();
  const list = [['modes', '1-toddlers-and-kids'], ['sky', '2-fly-the-sky'], ['water', '3-make-a-splash'], ['weewoo', '4-wee-woo'],
    ['bonk', '5-bonk-rockets'], ['rides', '6-twenty-rides'], ['worlds8', '7-eight-worlds'], ['parents2', '8-made-for-kids']];
  for (const [id, name] of [...list, ['feature2', 'feature']]) {
    const wide = id.startsWith('feature');
    const p = await b.newPage({ viewport: wide ? { width: 1024, height: 500 } : { width: 1080, height: 1920 } });
    await p.goto('file://' + path.join(__dirname, 'poster2.html') + '#' + id);
    await p.waitForTimeout(1500);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: wide ? path.join(out, 'feature-graphic.png') : path.join(out, 'screenshots', name + '.png') });
    await p.close();
  }
  await b.close();
})();
