// Probe: play one Fly-vs-Stockfish game, poll the page every 3 s with a short protocol timeout; log the last state before any unresponsiveness.
import puppeteer from '/Users/chiragpatnaik/.npm/_npx/8003d8991b0d346b/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const think = process.argv[2] || '10000';
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false,
  userDataDir: '/private/tmp/claude-501/flymate-bench-live', args: ['--enable-unsafe-webgpu', '--window-size=900,700'], protocolTimeout: 10000 });
const page = await browser.newPage();
page.on('console', m => { const t = m.text(); if (/error|Error|lost|reset/.test(t)) console.log('console:', t.slice(0, 200)); });
page.on('pageerror', e => console.log('pageerror:', e.message.slice(0, 200)));
await page.goto('https://flymate.naklitechie.com/', { waitUntil: 'load' });
for (;;) { try { if (await page.evaluate(() => !!(window.flymate && window.flymate.brain()))) break; } catch (e) { console.log('boot probe:', e.message.slice(0, 80)); } await new Promise(r => setTimeout(r, 3000)); }
console.log('brain ready');
await page.select('#opp', 'sf-1'); await page.select('#think', think); await page.evaluate(() => document.getElementById('duel').click());
let last = '', stalled = 0, t0 = Date.now();
for (;;) {
  await new Promise(r => setTimeout(r, 3000));
  try {
    const s = await page.evaluate(() => ({ st: document.getElementById('status').innerText, tm: document.getElementById('timing').innerText, n: window.flymate.game().history().length, last: window.flymate.game().history().slice(-1)[0] }));
    if (stalled) { console.log(`responsive again after ${stalled * 3}s`); stalled = 0; }
    const line = `${((Date.now() - t0) / 1000).toFixed(0)}s ply ${s.n} ${s.last || ''} | ${s.st.slice(0, 40)} | ${s.tm.split('·').slice(0, 3).join('·')}`;
    if (line.slice(4) !== last.slice(4)) { console.log(line); last = line; }
    if (/mate|Draw|Stalemate/.test(s.st) && s.n > 0) { console.log('GAME OVER:', s.st, s.n, 'plies'); break; }
  } catch (e) { stalled++; console.log(`UNRESPONSIVE ${stalled * 3}s (${e.message.slice(0, 60)}) — last: ${last}`); if (stalled >= 100) break; }
}
await browser.close();
