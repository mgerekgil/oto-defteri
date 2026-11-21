/* Oto Defteri — internetsiz çalışma: program dosyaları telefona kaydedilir. Sürüm değişince yenisi alınır. */
const ON = "oto-1.1.0";
const DOSYALAR = ["./", "index.html", "tasarim-temel.css", "app.css", "nacl-fast.min.js", "veri.js", "lisans.js", "google.js", "ekip.js", "app.js", "manifest.webmanifest", "simge-192.png", "simge-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(ON).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== ON).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;          // lisans listesi ve bildirim her zaman internetten
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const k = r.clone(); caches.open(ON).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
