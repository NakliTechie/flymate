// Play-strength check: fly (White) vs Stockfish skill 1, N games per weight set. node shots/duel-bench.mjs <weightsQuery> <games>
import puppeteer from '/Users/chiragpatnaik/.npm/_npx/8003d8991b0d346b/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const [wq, games, think] = [process.argv[2], +process.argv[3] || 4, process.argv[4] || '3000'];
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false,
  userDataDir: '/private/tmp/claude-501/flymate-bench-' + wq.replace(/\W/g, ''), args: ['--enable-unsafe-webgpu', '--window-size=900,700'] });
const page = await browser.newPage();
await page.goto('http://localhost:8791/?weights=' + wq, { waitUntil: 'load' });
await page.waitForFunction(() => window.flymate && window.flymate.brain(), { timeout: 180000 });
const results = [];
for (let g = 0; g < games; g++) {
  await page.select('#opp', 'sf-1'); await page.select('#think', think); await page.evaluate(() => document.getElementById('duel').click());
  await page.waitForFunction(() => /mate|Draw|Stalemate/.test(document.getElementById('status').innerText) && document.getElementById('duel').innerText.startsWith('Watch'), { timeout: 900000 });
  const r = await page.evaluate(() => ({ status: document.getElementById('status').innerText, plies: window.flymate.game().history().length, last: document.getElementById('timing').innerText.split('·').slice(0, 3).join('·') }));
  results.push(r); console.log(wq, 'think', think, 'game', g + 1, r.status, r.plies, 'plies |', r.last);
}
await browser.close();
const w = results.filter(r => /fly beats/.test(r.status)).length, d = results.filter(r => /Draw|Stalemate/.test(r.status)).length;
console.log(`${wq}: +${w} =${d} -${games - w - d} vs Stockfish skill 1`);
