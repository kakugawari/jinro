/*
 * make-icon.js — icon.svg から、iPhone のホーム画面用の PNG (apple-touch-icon.png, 180x180) を作る。
 *
 *   node make-icon.js                         → apple-touch-icon.png (180)
 *   node make-icon.js icon-180.png:180 icon-192.png:192 icon-512.png:512   → 名前と大きさを指定して作る
 *
 * iOS は apple-touch-icon に SVG を使えない (CLAUDE.md の落とし穴)。
 * 角は iOS が丸めるので、PNG は角を丸めず四角いまま塗りつぶす (透けた角は黒く出る)。
 * icon.svg を描き替えたら、これをもう一度流す。
 *
 * 字の書体: この作業環境には明朝体が無く、指定しても ゴシック体で描かれる (人狼のアイコンで踏んだ)。
 * ICON_FONT_CSS に @fontsource の CSS (例: .../@fontsource/noto-serif-jp/900.css) を渡すと、
 * icon.svg の字が入っている部分だけを埋め込んで、その書体で描く。
 *   ICON_FONT_CSS=/path/to/900.css node make-icon.js icon-180.png:180
 */
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const { chromium } = require('playwright');
  const svg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8')
    .replace(/(<rect\b[^>]*?)\s+rx="[^"]*"/, '$1');   // いちばん外の地だけ角を四角に
  const fontCss = process.env.ICON_FONT_CSS ? embedFont(process.env.ICON_FONT_CSS, svg) : '';
  const browser = await chromium.launch();
  const jobs = process.argv.slice(2).map((a) => { const [name, size] = a.split(':'); return { name, size: Number(size) || 180 }; });
  if (!jobs.length) jobs.push({ name: 'apple-touch-icon.png', size: 180 });
  for (const { name, size } of jobs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<html><head><style>${fontCss}</style></head><body style="margin:0">${svg.replace('<svg ', `<svg style="width:${size}px;height:${size}px;display:block" `)}</body></html>`);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); });
    const out = path.join(__dirname, name);
    await page.screenshot({ path: out, omitBackground: false });
    await page.close();
    console.log(`書いた: ${name} (${size}x${size}, ${fs.statSync(out).size} バイト)`);
  }
  await browser.close();
})();

/** @font-face の中から、svg の字が入っている部分 (unicode-range) だけを data: で埋め込んだ CSS を返す。 */
function embedFont(cssPath, svg) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const text = svg.replace(/<[^>]*>/g, '');
  const codes = [...new Set([...text].map((ch) => ch.codePointAt(0)))];
  const covers = (range) => range.split(',').some((r) => {
    const m = r.trim().match(/^U\+([0-9A-F]+)(?:-([0-9A-F]+))?$/i);
    if (!m) return false;
    const a = parseInt(m[1], 16), b = m[2] ? parseInt(m[2], 16) : a;
    return codes.some((c) => c >= a && c <= b);
  });
  const out = [];
  for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
    const range = (block.match(/unicode-range:\s*([^;]+);/) || [])[1];
    if (range && !covers(range)) continue;
    const url = (block.match(/url\(([^)]+\.woff2)\)/) || [])[1];
    if (!url) continue;
    const file = path.resolve(path.dirname(cssPath), url.replace(/^['"]|['"]$/g, ''));
    const data = fs.readFileSync(file).toString('base64');
    out.push(block.replace(/src:[^;]+;/, `src: url(data:font/woff2;base64,${data}) format('woff2');`));
  }
  console.log(`書体: ${out.length} 個の部分を埋め込んだ (${path.basename(cssPath)})`);
  return out.join('\n');
}
