// Service worker van de online Sticht Leerlingmonitor.
// - De pagina zelf: eerst van het netwerk (dan heb je altijd de nieuwste versie), zonder internet uit de cache.
// - Het rekenprogramma (Pyodide van cdn.jsdelivr.net, met een vast versienummer in het adres): uit de cache, zodat opstarten sneller gaat.
// Er worden geen gegevens van gebruikers opgeslagen of verstuurd: alleen de pagina en het programma zelf komen in de cache.
const CACHE = 'leerlingmonitor-1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.hostname === 'cdn.jsdelivr.net' && u.pathname.startsWith('/pyodide/')) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request);
      if (r.ok) c.put(e.request, r.clone());
      return r;
    }));
  } else if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const kopie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); }
      return r;
    }).catch(() => caches.match(e.request)));
  }
});
