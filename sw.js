/*
 * sw.js — オフラインでも開けるようにする。
 * つながっていれば必ず最新を取りにいき (ネット優先)、取れたものをしまっておく。
 * つながらないときだけ、しまっておいたものを出す。
 * (キャッシュ優先にすると「直したのに古い画面が出る」。CLAUDE.md の落とし穴)
 */
const CACHE = 'jinro-v1';
const FILES = ['./', './index.html', './styles.css', './app.js', './manifest.json',
  './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
