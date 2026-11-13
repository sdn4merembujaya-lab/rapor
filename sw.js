// Service worker e-Rapor SD: jaringan dulu, cadangan dari cache bila offline.
// Naikkan nomor VERSI setiap kali index.html diganti.
const VERSI = 'erapor-sd-v1';
const INTI = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(INTI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Daftar guru harus selalu terbaru: jangan di-cache.
  if (url.pathname.endsWith('/guru.json')) return;
  const bolehCache = url.origin === location.origin || url.hostname === 'cdnjs.cloudflare.com';
  if (!bolehCache) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const salin = res.clone();
        caches.open(VERSI).then(c => c.put(req, salin));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
