/* Esnaf Oto Detay Mobil — veri katmanı. Her şey bu telefonda (IndexedDB). Açılışta belleğe alınır, her değişiklik hemen yazılır.
   1.1.0: her kayıtta değişiklik zamanı (d), silinenler listesi (birleştirmede geri gelmesin), stok hareketleri (hareket deposu). */
"use strict";
const Veri = (() => {
  const AD = "oto-defteri", SURUM = 1, KAYIT = ["hasta", "islem", "malzeme", "hareket"];
  let db = null;
  const M = {ayar: {}, hasta: [], islem: [], malzeme: [], hareket: []};
  const simdi = () => new Date().toISOString();

  function ac() {
    return new Promise((ok, hata) => {
      const r = indexedDB.open(AD, SURUM);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains("ayar")) d.createObjectStore("ayar", {keyPath: "k"});
        for (const s of KAYIT) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, {keyPath: "id"});
        if (!d.objectStoreNames.contains("foto")) d.createObjectStore("foto", {keyPath: "id"});          // fotoğraflar: yalnız bu telefonda (yedek ve ekip dosyasına girmez)
      };
      r.onsuccess = () => { db = r.result; ok(db); };
      r.onerror = () => hata(r.error || new Error("Veri açılamadı"));
    });
  }
  const tumu = s => new Promise((ok, hata) => { const q = db.transaction(s).objectStore(s).getAll(); q.onsuccess = () => ok(q.result || []); q.onerror = () => hata(q.error); });
  const yaz = (s, v) => new Promise((ok, hata) => { const t = db.transaction(s, "readwrite"); t.objectStore(s).put(v); t.oncomplete = () => ok(v); t.onerror = () => hata(t.error); });
  const silD = (s, k) => new Promise((ok, hata) => { const t = db.transaction(s, "readwrite"); t.objectStore(s).delete(k); t.oncomplete = () => ok(); t.onerror = () => hata(t.error); });
  const temizle = s => new Promise((ok, hata) => { const t = db.transaction(s, "readwrite"); t.objectStore(s).clear(); t.oncomplete = () => ok(); t.onerror = () => hata(t.error); });

  async function ayarYaz(k, v) { M.ayar[k] = v; await yaz("ayar", {k, v}); }
  async function yukle() {
    await ac();
    for (const a of await tumu("ayar")) M.ayar[a.k] = a.v;
    for (const s of KAYIT) M[s] = await tumu(s);
    // 1.1.0 geçişi: eski sürümün "kalan stok" sayıları açılış hareketine çevrilir (kimlik malzemeye bağlı: iki telefonda aynı)
    if (!M.ayar.hareketGecis) {
      for (const m of M.malzeme) if (m.stokTut && +m.stok) { const h = {id: "ac:" + m.id, malId: m.id, n: +m.stok, tur: "acilis", ts: simdi().slice(0, 19), d: "2000-01-01T00:00:00.000Z"}; M.hareket.push(h); await yaz("hareket", h); }
      await ayarYaz("hareketGecis", simdi());
    }
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* tarayıcı izin vermeyebilir */ }
  }
  const yeniId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  return {
    M, yukle, yeniId, ayarYaz,
    fotoYaz: o => yaz("foto", o), fotoSil: id => silD("foto", id),
    fotoOku: id => new Promise((ok, hata) => { const q = db.transaction("foto").objectStore("foto").get(id); q.onsuccess = () => ok(q.result || null); q.onerror = () => hata(q.error); }),
    fotolar: () => tumu("foto"),
    ayar: k => M.ayar[k],
    async kaydet(s, o) { if (!o.id) o.id = yeniId(); o.d = simdi(); const i = M[s].findIndex(x => x.id === o.id); if (i >= 0) M[s][i] = o; else M[s].push(o); await yaz(s, o); return o; },
    async hamYaz(s, o) { const i = M[s].findIndex(x => x.id === o.id); if (i >= 0) M[s][i] = o; else M[s].push(o); await yaz(s, o); return o; },      // birleştirme: değişiklik zamanı korunur
    async sil(s, id, iz = true) {
      M[s] = M[s].filter(x => x.id !== id); await silD(s, id);
      if (iz) { const sl = Object.assign({}, M.ayar.silinen || {}); sl[id] = simdi(); const k = Object.keys(sl); if (k.length > 5000) k.sort((a, b) => sl[a].localeCompare(sl[b])).slice(0, k.length - 5000).forEach(x => delete sl[x]); await ayarYaz("silinen", sl); }
    },
    async fotoTemizle() { await temizle("foto"); },
    disaAl() { return {tur: "OtoDefteriYedek", v: 1, tarih: simdi(), ayar: M.ayar, hasta: M.hasta, islem: M.islem, malzeme: M.malzeme, hareket: M.hareket}; },
    async iceAl(y) {
      if (!y || y.tur !== "OtoDefteriYedek") throw new Error("Bu dosya Esnaf Oto Detay Mobil yedeği değil");
      for (const s of ["ayar", ...KAYIT]) await temizle(s);
      const kal = {cihaz: M.ayar.cihaz, ilk: M.ayar.ilk, liste: M.ayar.liste};          // bu telefonun lisans kimliği yedekle değişmez
      M.ayar = {};
      for (const [k, v] of Object.entries(Object.assign({}, y.ayar || {}, Object.fromEntries(Object.entries(kal).filter(([, v]) => v !== undefined))))) { M.ayar[k] = v; await yaz("ayar", {k, v}); }
      for (const s of KAYIT) { M[s] = Array.isArray(y[s]) ? y[s] : []; for (const o of M[s]) await yaz(s, o); }
      if (!Array.isArray(y.hareket)) { M.ayar.hareketGecis = ""; await yaz("ayar", {k: "hareketGecis", v: ""}); for (const m of M.malzeme) if (m.stokTut && +m.stok) { const h = {id: "ac:" + m.id, malId: m.id, n: +m.stok, tur: "acilis", ts: simdi().slice(0, 19), d: "2000-01-01T00:00:00.000Z"}; M.hareket.push(h); await yaz("hareket", h); } await ayarYaz("hareketGecis", simdi()); }
    }
  };
})();
