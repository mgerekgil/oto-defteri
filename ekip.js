/* Esnaf Oto Detay Mobil — ekip (birden fazla telefon). Vardiya sonunda "Defteri paylaş" → WhatsApp → karşı telefonda "Birleştir".
   Kayıtlar kimlikleriyle eşleşir: aynı kayıt bir kez kalır, yeni kayıtlar eklenir, aynı kayıt iki tarafta değiştiyse son değişiklik geçer,
   silinen kayıt geri gelmez. Aynı adlı malzemeler tek malzeme sayılır; aynı plakalı araçlar için "aynı araç mı?" sorulur.
   Dosya ortak "ekip şifresi" ile şifrelenir (AES-GCM, PBKDF2) — Android ve iPhone'da aynı. */
"use strict";
const Ekip = (() => {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = u => { let s = ""; for (const x of u) s += String.fromCharCode(x); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const kucuk = s => String(s || "").toLocaleLowerCase("tr").trim().replace(/\s+/g, " ");
  const telR = t => String(t || "").replace(/\D/g, "").slice(-10);
  async function anahtar(sifre, tuz) {
    const k = await crypto.subtle.importKey("raw", enc.encode("oto-ekip|" + sifre), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({name: "PBKDF2", hash: "SHA-256", salt: tuz, iterations: 200000}, k, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]);
  }
  async function paket(sifre) {
    const M = Veri.M, tuz = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const veri = {tur: "OtoDefteriEkip", v: 1, tarih: new Date().toISOString(), cihaz: Veri.ayar("cihaz"), isletme: Veri.ayar("isletmeAd") || "",
      hasta: M.hasta, islem: M.islem, malzeme: M.malzeme, hareket: M.hareket, silinen: Veri.ayar("silinen") || {}, gruplar: Veri.ayar("gruplar") || null, odemeTurleri: Veri.ayar("odemeTurleri") || null};
    const c = new Uint8Array(await crypto.subtle.encrypt({name: "AES-GCM", iv}, await anahtar(sifre, tuz), enc.encode(JSON.stringify(veri))));
    return JSON.stringify({tur: "OtoDefteriPaylasim", v: 1, tarih: veri.tarih, isletme: veri.isletme, cihaz: veri.cihaz, hasta: M.hasta.length, islem: M.islem.length, s: b64(tuz), iv: b64(iv), c: b64(c)});
  }
  async function ac(metin, sifre) {
    let y; try { y = JSON.parse(metin); } catch (e) { throw new Error("Bu dosya Esnaf Oto Detay Mobil paylaşım dosyası değil"); }
    if (y.tur !== "OtoDefteriPaylasim") throw new Error(y.tur === "OtoDefteriYedekSifreli" ? "Bu bir yedek dosyası: Ayarlar → Yedekten geri yükle ile açın. Birleştirmek için karşı telefonda \"Defteri paylaş\" kullanın." : "Bu dosya Esnaf Oto Detay Mobil paylaşım dosyası değil");
    try { return JSON.parse(dec.decode(await crypto.subtle.decrypt({name: "AES-GCM", iv: unb64(y.iv)}, await anahtar(sifre, unb64(y.s)), unb64(y.c)))); }
    catch (e) { throw new Error("Ekip şifresi yanlış: iki telefonda Ayarlar → Ekip → Ekip şifresi aynı olmalı"); }
  }
  // Ne değişeceğini hesaplar (hiçbir şey yazmaz). y: açılmış paket
  function plan(y) {
    const M = Veri.M, silY = Veri.ayar("silinen") || {}, silG = y.silinen || {};
    const yeniMi = (a, b) => String(a.d || "") > String(b.d || "");
    // malzeme eşleme: kimlik, yoksa aynı ad
    const malHarita = {};
    const malEkle = [], malGun = [];
    for (const m of y.malzeme || []) {
      if (silY[m.id] && silY[m.id] >= String(m.d || "")) continue;
      const yerel = M.malzeme.find(x => x.id === m.id) || M.malzeme.find(x => kucuk(x.ad) === kucuk(m.ad));
      if (yerel) { malHarita[m.id] = yerel.id; if (yerel.id === m.id && yeniMi(m, yerel)) malGun.push(m); }
      else { malHarita[m.id] = m.id; malEkle.push(m); }
    }
    const malId = id => malHarita[id] || id;
    const kayit = (s, donustur) => {
      const ekle = [], gun = [];
      for (let o of y[s] || []) {
        if (silY[o.id] && silY[o.id] >= String(o.d || "")) continue;
        o = donustur ? donustur(o) : o;
        if (silY[o.id] && silY[o.id] >= String(o.d || "")) continue;            // dönüştürülmüş kimlikle de silinmişse alınmaz
        const yerel = M[s].find(x => x.id === o.id);
        if (!yerel) ekle.push(o); else if (yeniMi(o, yerel)) gun.push(o);
      }
      return {ekle, gun};
    };
    const hasta = kayit("hasta");
    const islem = kayit("islem", o => Object.assign({}, o, {kalemler: (o.kalemler || []).map(k => Object.assign({}, k, {malId: malId(k.malId)}))}));
    const hareket = kayit("hareket", o => {
      const mid = malId(o.malId); let id = o.id;
      if (id.startsWith("ac:")) id = "ac:" + mid;                                           // açılış hareketi malzeme başına bir tane (işlem tüketimi i:<işlem>:<sıra> her telefonda aynı)
      return Object.assign({}, o, {id, malId: mid});
    });
    // aynı malzemenin iki açılış hareketi (iki telefonda ayrı kurulum): gelen açılış, yerelde aynı malzemenin açılışı varsa eklenmez
    hareket.ekle = hareket.ekle.filter(h => !(h.tur === "acilis" && M.hareket.some(x => x.id === h.id)));
    const sil = Object.entries(silG).filter(([id, t]) => (silY[id] || "") < t).map(([id, t]) => {
      for (const s of ["hasta", "islem", "malzeme", "hareket"]) { const o = M[s].find(x => x.id === id); if (o && String(o.d || "") <= t) return {s, id, t}; }
      return {s: "", id, t};
    });
    const gruplar = [...(Veri.ayar("gruplar") || []), ...((y.gruplar || []).filter(g => !(Veri.ayar("gruplar") || []).some(x => kucuk(x) === kucuk(g))))];
    const odeme = [...(Veri.ayar("odemeTurleri") || ["Nakit", "Kart", "EFT / Havale"])];
    for (const o of y.odemeTurleri || []) if (!odeme.some(x => kucuk(x) === kucuk(o))) odeme.push(o);
    return {y, malEkle, malGun, hasta, islem, hareket, sil, gruplar, odeme,
      ozet: {yeniHasta: hasta.ekle.length, yeniIslem: islem.ekle.length, guncel: hasta.gun.length + islem.gun.length + malGun.length, yeniMalzeme: malEkle.length, silinen: sil.filter(x => x.s).length}};
  }
  async function uygula(p) {
    for (const m of p.malEkle) await Veri.hamYaz("malzeme", Object.assign({}, m, {stok: 0}));
    for (const m of p.malGun) { const yerel = Veri.M.malzeme.find(x => x.id === m.id); await Veri.hamYaz("malzeme", Object.assign({}, m, {stok: yerel ? yerel.stok : 0})); }
    for (const s of ["hasta", "islem", "hareket"]) for (const o of [...p[s].ekle, ...p[s].gun]) await Veri.hamYaz(s, o);
    const sl = Object.assign({}, Veri.ayar("silinen") || {});
    for (const x of p.sil) { if (x.s) await Veri.sil(x.s, x.id, false); sl[x.id] = x.t; }
    await Veri.ayarYaz("silinen", sl);
    if (Veri.ayar("gruplar") || p.y.gruplar) await Veri.ayarYaz("gruplar", p.gruplar.length ? p.gruplar : p.y.gruplar);
    await Veri.ayarYaz("odemeTurleri", p.odeme);
    const g = Object.assign({}, Veri.ayar("ekipSon") || {}); g[p.y.cihaz || "?"] = {t: new Date().toISOString(), isletme: p.y.isletme || ""}; await Veri.ayarYaz("ekipSon", g);
  }
  // aynı araç olabilecek çiftler: aynı plaka
  function ciftler() {
    const L = Veri.M.hasta, out = [], red = Veri.ayar("farkliKisi") || [];
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j], pn = x => String(x.plaka || "").toLocaleUpperCase("tr").replace(/[^0-9A-ZÇĞİÖŞÜ]/g, ""); if (!pn(a) || pn(a) !== pn(b)) continue;          // aynı plaka = aynı araç
      if (red.includes([a.id, b.id].sort().join("|"))) continue;
      out.push([a, b]);
    }
    return out;
  }
  async function kisiBirlestir(a, b) {          // b'nin işlemleri a'ya geçer, b silinir
    for (const i of Veri.M.islem.filter(x => x.hastaId === b.id)) { i.hastaId = a.id; await Veri.kaydet("islem", i); }
    const birles = (x, y) => [x, y].map(v => String(v || "").trim()).filter(Boolean).filter((v, k, arr) => arr.findIndex(w => kucuk(w) === kucuk(v)) === k).join(" · ");
    a.kurler = [...(a.kurler || []), ...(b.kurler || []).filter(k => !(a.kurler || []).some(x => x.id === k.id))];          // 1.3.0: kürler de geçer
    Object.assign(a, {ad: a.ad || b.ad, tel: a.tel || b.tel, marka: a.marka || b.marka, renk: a.renk || b.renk, sinif: a.sinif || b.sinif, not: birles(a.not, b.not), ilk: [a.ilk, b.ilk].filter(Boolean).sort()[0] || a.ilk});
    await Veri.kaydet("hasta", a); await Veri.sil("hasta", b.id);
  }
  async function farkli(a, b) { const r = Veri.ayar("farkliKisi") || []; r.push([a.id, b.id].sort().join("|")); await Veri.ayarYaz("farkliKisi", r); }
  return {paket, ac, plan, uygula, ciftler, kisiBirlestir, farkli};
})();
