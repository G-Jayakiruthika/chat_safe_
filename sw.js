/**
 * The scope is read from the worker's own URL rather than hard-coded, because the
 * app is served from the domain root on Cloud Run and from /TrueSafe/ on GitHub
 * Pages. Everything below is relative to that root.
 */
const ROOT = new URL('./', location).pathname;
const CACHE = 'truesafe-v2';
const SHELL = [ROOT, `${ROOT}manifest.webmanifest`, `${ROOT}icon.svg`];

self.addEventListener('install', (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting())));

self.addEventListener('activate', (e) =>
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x))))));

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  // Never cache API traffic or anything off-origin: it may carry private data.
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match(ROOT))),
  );
});
