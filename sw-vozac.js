// Stranica za vozače radi i bez interneta: mobitel je spremi pri prvom otvaranju.
// Otvaranje uvijek odmah pokaže spremljenu verziju; ako ima veze, u pozadini preuzme novu (vidi se kod sljedećeg otvaranja).
// Radi samo za gorivo-vozac.html (scope pri registraciji) – glavnu aplikaciju ne dira.
const SPREMNIK = 'gorivo-vozac-stranica';
const STRANICA = new URL('gorivo-vozac.html', self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SPREMNIK).then(c => c.add(new Request(STRANICA, {cache: 'reload'}))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin + url.pathname !== STRANICA) return;   // sve ostalo ide normalno
  e.respondWith(caches.open(SPREMNIK).then(async c => {
    const spremljeno = await c.match(STRANICA);
    const svjeze = fetch(STRANICA, {cache: 'no-cache'})
      .then(r => { if (r.ok) c.put(STRANICA, r.clone()); return r; });
    if (spremljeno) { e.waitUntil(svjeze.catch(() => {})); return spremljeno; }
    return svjeze;
  }));
});
