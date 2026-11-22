/* Esnaf Oto Detay Mobil — lisans. Satıcının Lisans Yöneticisi'ndeki imzalı listeyle çalışır (masaüstü programlarla aynı düzen).
   Cihaz kodu ilk açılışta üretilir ve bu telefonda saklanır. Liste internet varken alınır, imzası doğrulanır; internetsiz lease_days gün çalışır.
   Hasta bilgisi hiçbir yere gönderilmez: bildirimde yalnız kod özeti, sürüm ve MÜHÜRLÜ (yalnız satıcının açabildiği) işletme adı / telefonu gider. */
"use strict";
const Lisans = (() => {
  const APP = "OTODEFTERI", ONEK = "oto-lisans:";
  const LISTE_URL = "https://raw.githubusercontent.com/mgerekgil/lisans-listesi/main/oto-lisanslar.json";
  const LISTE_API = "https://api.github.com/repos/mgerekgil/lisans-listesi/contents/oto-lisanslar.json?ref=main";      // 1.0.3: önbelleksiz (raw 5 dk önbellekte tutuyordu, iptal geç geliyordu)
  const ACIK_ANAHTAR = "23f5e27f5323c96f081e96d3437bf5807fe966a8f3512d162cf937db5c7b74f9";       // Lisans Yöneticisi'nin imza (doğrulama) anahtarı
  const MUHUR_ANAHTAR = "f226092bc7ff2bb4fcf45d2bf5175498bcef5b60370eec039697a73e1817f252";       // satıcının mühür anahtarı (yalnız satıcı açar)
  const VARSAYILAN_DENEME = 7, VARSAYILAN_KIRA = 20;
  const enc = new TextEncoder();
  const hex = b => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
  const hexb = h => new Uint8Array((h.match(/../g) || []).map(x => parseInt(x, 16)));
  const birles = (...a) => { const n = a.reduce((s, x) => s + x.length, 0), o = new Uint8Array(n); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
  const sha = async b => new Uint8Array(await crypto.subtle.digest("SHA-256", b));
  const bugun = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const gunFark = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5);

  // Python json.dumps(sort_keys=True, separators=(",", ":"), ensure_ascii=False) ile aynı metin (imza bu metin üzerinden)
  function kanon(v) {
    if (v === null || typeof v !== "object") return JSON.stringify(v);
    if (Array.isArray(v)) return "[" + v.map(kanon).join(",") + "]";
    return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + kanon(v[k])).join(",") + "}";
  }
  function dogrula(doc) {
    try {
      const p = doc && doc.payload;
      if (!p || p.app !== APP || !/^[0-9a-f]{128}$/.test(doc.sig || "")) return false;
      return nacl.sign.detached.verify(enc.encode(kanon(p)), hexb(doc.sig), hexb(ACIK_ANAHTAR));
    } catch (e) { return false; }
  }
  function kodUret() {
    const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = crypto.getRandomValues(new Uint8Array(12));
    const s = [...r].map(x => A[x % A.length]).join("");
    return s.slice(0, 4) + "-" + s.slice(4, 8) + "-" + s.slice(8);
  }
  async function kodOzeti(kod) { return hex(await sha(enc.encode(ONEK + String(kod).trim().toUpperCase()))).slice(0, 20); }
  async function telOzeti(tel) { const d = String(tel || "").replace(/\D/g, "").slice(-10); return d ? hex(await sha(enc.encode("oto-tel:" + d))).slice(0, 20) : ""; }

  // Mühür (Lisans Yöneticisi muhur.py ile aynı biçim): X25519 + SHA-256 akış + HMAC
  async function muhurle(obj, acik = MUHUR_ANAHTAR) {
    const pub = typeof acik === "string" ? hexb(acik) : acik;
    const raw = enc.encode(JSON.stringify(obj));
    const eph = crypto.getRandomValues(new Uint8Array(32));
    const epub = nacl.scalarMult.base(eph), ortak = nacl.scalarMult(eph, pub);
    const k = await sha(birles(ortak, epub, pub));
    const tohum = birles(k.slice(0, 16), enc.encode("s"));
    const akis = new Uint8Array(raw.length);
    for (let i = 0, o = 0; o < raw.length; i++) {
      const blok = await sha(birles(tohum, new Uint8Array([i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, i & 255])));
      akis.set(blok.slice(0, Math.min(32, raw.length - o)), o); o += 32;
    }
    const ct = raw.map((b, i) => b ^ akis[i]);
    const hk = await crypto.subtle.importKey("raw", k, {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
    const tag = new Uint8Array(await crypto.subtle.sign("HMAC", hk, birles(epub, ct))).slice(0, 10);
    let s = ""; for (const b of birles(epub, ct, tag)) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  let SON = null;            // son hesaplanan durum
  async function hazirla() {
    if (!Veri.ayar("cihaz")) await Veri.ayarYaz("cihaz", kodUret());
    if (!Veri.ayar("ilk")) await Veri.ayarYaz("ilk", bugun());
  }
  async function listeAl() {
    try {
      let doc = null;
      for (const [u, h] of [[LISTE_API, {Accept: "application/vnd.github.raw+json"}], [LISTE_URL + "?t=" + Date.now(), {}]]) {          // önce önbelleksiz yol, olmazsa raw
        try { const r = await fetch(u, {cache: "no-store", headers: h}); if (!r.ok) continue; const d = await r.json(); if (dogrula(d)) { doc = d; break; } } catch (e) { /* sıradaki */ }
      }
      if (!doc) return false;
      const eski = Veri.ayar("liste");
      if (eski && eski.payload && String(eski.payload.issued) > String(doc.payload.issued)) return false;        // eski listeyle geri alınamaz
      await Veri.ayarYaz("liste", doc);
      await Veri.ayarYaz("listeAlindi", bugun());
      return true;
    } catch (e) { return false; }
  }
  async function durum() {
    const doc = Veri.ayar("liste"), p = (doc && dogrula(doc) && doc.payload) || null;
    const kod = Veri.ayar("cihaz"), oz = await kodOzeti(kod), t = bugun();
    const e = p && p.entries ? p.entries[oz] : null;
    const kira = (p && p.lease_days) || VARSAYILAN_KIRA, alindi = Veri.ayar("listeAlindi") || Veri.ayar("ilk");
    const sonGorulen = Veri.ayar("sonGun") || t;
    if (t > sonGorulen) await Veri.ayarYaz("sonGun", t);
    const geriSaat = gunFark(sonGorulen, t) < -1;
    let d;
    if (e) {
      if (e.s === "iptal") d = {tur: "iptal", yaz: "Lisans iptal edildi", acik: false};
      else if (e.until && e.until < t) d = {tur: "bitti", yaz: "Lisans süresi bitti · " + e.until.split("-").reverse().join("."), acik: false};
      else d = {tur: "aktif", yaz: e.until ? "Bitiş " + e.until.split("-").reverse().join(".") : "Süresiz", acik: true, bitis: e.until || ""};
      if (d.acik && gunFark(alindi, t) > kira) d = {tur: "cevrimdisi", yaz: `${kira} gündür lisans yenilenmedi · internete bağlanın`, acik: false};
    } else {
      const telOz = await telOzeti(Veri.ayar("isletmeTel"));
      const engel = p && Array.isArray(p.engel) && telOz && p.engel.includes(telOz);
      const gun = (p && p.trial_days) || VARSAYILAN_DENEME, kalan = gun - gunFark(Veri.ayar("ilk"), t);
      if (engel) d = {tur: "engel", yaz: "Bu işletmeye deneme verilmiyor · satıcınızla görüşün", acik: false};
      else if (kalan > 0) d = {tur: "deneme", yaz: `Deneme · ${kalan} gün kaldı`, acik: true, kalan};
      else d = {tur: "deneme_bitti", yaz: "Deneme süresi bitti", acik: false};
    }
    if (geriSaat && d.acik) d = {tur: "saat", yaz: "Telefonun tarihi geri alınmış görünüyor · tarihi düzeltin", acik: false};
    d.kod = kod; d.duyuru = (e && e.n) || (p && p.notice && p.notice.m) || ""; d.mesaj = (e && e.m) || "";
    SON = d;
    return d;
  }
  async function bildir(surum) {
    const doc = Veri.ayar("liste"), p = doc && doc.payload, f = p && p.ping;
    if (!f || !f.u || !/^https:\/\/docs\.google\.com\//.test(f.u)) return false;
    const son = Veri.ayar("sonBildirim") || 0;
    if (Date.now() - son < 6 * 3600e3) return false;
    try {
      const kod = Veri.ayar("cihaz"), d = SON || await durum();
      const m = await muhurle({k: kod, n: Veri.ayar("isletmeAd") || "", a: APP, l: d.tur === "aktif" ? (d.bitis ? "timed" : "full") : d.tur === "deneme" ? "trial" : d.tur,
        s: "", y: Veri.ayar("google") ? Veri.ayar("google").e || "" : "", t: Veri.ayar("isletmeTel") || ""});
      const v = new URLSearchParams(); v.set(f.k, await kodOzeti(kod)); v.set(f.p, APP); v.set(f.v, surum + "|" + m);
      await fetch(f.u, {method: "POST", mode: "no-cors", body: v});
      await Veri.ayarYaz("sonBildirim", Date.now());
      return true;
    } catch (e) { return false; }
  }
  return {hazirla, listeAl, durum, bildir, kodOzeti, telOzeti, muhurle, kanon, dogrula, son: () => SON, APP};
})();
