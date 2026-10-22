const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const out = process.argv[2]; // the store/ folder
(async () => {
  const b = await chromium.launch();
  const list = [['hero', '1-hold-to-go'], ['turbo', '2-turbo-blast'], ['bonk', '3-bonk-rockets'], ['worlds', '4-six-worlds'], ['garage', '5-dream-car'], ['honk', '6-honk-honk'], ['parents', '7-made-for-kids']];
  for (const [id, name] of [...list, ['feature', 'feature']]) {
    const wide = id === 'feature';
    const p = await b.newPage({ viewport: wide ? { width: 1024, height: 500 } : { width: 1080, height: 1920 } });
    await p.goto('file://' + path.join(__dirname, 'poster.html') + '#' + id);
    await p.waitForTimeout(1500);
    await p.evaluate(() => document.fonts.ready);
    const file = wide ? path.join(out, 'feature-graphic.png') : path.join(out, 'screenshots', name + '.png');
    await p.screenshot({ path: file });
    await p.close();
  }
  await b.close();
})();
