// Screenshots for the launch tweets: real Chrome (WebGPU), own profile, local weights.
//   node shots/capture.mjs
import puppeteer from '/Users/chiragpatnaik/.npm/_npx/8003d8991b0d346b/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: false, userDataDir: '/private/tmp/claude-501/flymate-shots-profile',
  args: ['--enable-unsafe-webgpu', '--window-size=1180,1000', '--hide-scrollbars'], defaultViewport: { width: 1180, height: 1000, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console.error:', m.text().slice(0, 120)); });
await page.goto('http://localhost:8791/?weights=local', { waitUntil: 'load' });
await page.waitForFunction(() => window.flymate && window.flymate.brain(), { timeout: 180000 });
console.log('brain ready');
const play = async (san) => page.evaluate(async (san) => {
  const F = window.flymate; const idx = s => 'abcdefgh'.indexOf(s[0]) + 8 * (8 - +s[1]); const cells = () => [...document.querySelectorAll('#board .sq')];
  const g = F.game(); const mv = g.moves({ verbose: true }).find(m => m.san === san); if (!mv) return 'ILLEGAL ' + san;
  cells()[idx(mv.from)].click(); await new Promise(r => setTimeout(r, 60)); cells()[idx(mv.to)].click();
  for (let i = 0; i < 400; i++) { await new Promise(r => setTimeout(r, 100)); const st = document.getElementById('status').innerText; if (st.startsWith('Your move') || /mate|Draw|Stalemate/.test(st)) return g.history().join(' '); }
  return 'timeout';
}, san);
const shot = (name) => page.screenshot({ path: `shots/${name}.png`, clip: { x: 0, y: 0, width: 1180, height: 990 } });

// 1 — mid-game vs the fly (Ruy Lopez, the fly's book replies)
for (const m of ['e4', 'Nf3', 'Bb5', 'Ba4', 'Bb3', 'O-O', 'Re1']) console.log(await play(m));
await shot('1-vs-fly');

// 2 — opponent dropdown open on Stockfish
await page.select('#opp', 'sf-5'); await page.evaluate(() => document.getElementById('opp').dispatchEvent(new Event('change')));
await page.evaluate(() => document.getElementById('new').click()); await new Promise(r => setTimeout(r, 4000));
for (const m of ['d4', 'c4', 'Nc3', 'Nf3']) console.log(await play(m));
await shot('2-vs-stockfish');

// 3 — the duel, caught mid-game, then its end
await page.select('#opp', 'sf-1');
await page.evaluate(() => document.getElementById('duel').click());
await page.waitForFunction(() => window.flymate.game().history().length >= 24, { timeout: 120000 });
await shot('3-duel-midgame');
await page.waitForFunction(() => /mate|Draw|Stalemate/.test(document.getElementById('status').innerText) && document.getElementById('duel').innerText.startsWith('Watch'), { timeout: 400000 });
console.log('duel:', await page.evaluate(() => document.getElementById('status').innerText + ' | ' + window.flymate.game().history().length + ' plies | ' + window.flymate.game().history().join(' ')));
await shot('4-duel-end');
await browser.close();
