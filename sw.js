// Offline support for Hollowmere. build.ps1 fills in the version and the file list.
const CACHE = 'hollowmere-20261024-161610';
const FILES = ['./','./index.html','./manifest.webmanifest','./privacy.html','./fonts/IMFellEnglish-400-italic.woff2','./fonts/IMFellEnglish-400-normal.woff2','./fonts/IMFellEnglishSC-400-normal.woff2','./fonts/JetBrainsMono-500-normal.woff2','./fonts/LICENSES.txt','./fonts/Spectral-400-italic.woff2','./fonts/Spectral-400-normal.woff2','./fonts/Spectral-600-normal.woff2','./icons/apple-touch-icon.png','./icons/favicon-32.png','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Pages: try the network so updates arrive, fall back to the saved copy when offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  // Fonts, icons and everything else: the saved copy first.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
