/* Esnaf Oto Detay Mobil — ekranlar. Oto yıkama, detay ve kaplama işletmeleri için; bilgisayar gerekmez, veriler yalnız bu telefonda / tablette (veri.js), lisans lisans.js'te.
   Kayıt adları Klinik Defteri altyapısından kaldı: hasta = araç (plaka), malzeme = katalog (hizmet / ürün), islem = iş (yıkama, detay, ürün satışı). */
"use strict";
const SURUM = "1.2.1";
const SATICI_TEL = "905309469947";
const GOOGLE_CLIENT_ID = "1044147751394-qo809o3sndht657dcbr8cprj3m2s96dt.apps.googleusercontent.com";      // Google ile bağla (isteğe bağlı) · Drive'da yalnız bu programın klasörü
const VARSAYILAN_GRUP = ["Yıkama", "İç temizlik", "Pasta cila", "Seramik", "PPF", "Cam filmi", "Ürün"];
const DETAY_GRUP = ["Pasta cila", "Seramik", "PPF", "Cam filmi"];
const gruplar = () => { const g = Veri.ayar("gruplar"); return Array.isArray(g) && g.length ? g : VARSAYILAN_GRUP; };
const SINIF_VARSAYILAN = ["Küçük", "Orta", "SUV / Pikap", "Büyük / Ticari"];
const siniflar = () => { const s = Veri.ayar("siniflar"); return Array.isArray(s) && s.length === 4 ? s : SINIF_VARSAYILAN; };
// [ad, grup, 4 sınıf fiyatı, maliyet (ürün payı), garanti ay, bakım ay, sık]
const ORNEK_HIZMET = [
  ["Dış yıkama", "Yıkama", [250, 300, 350, 400], 20, 0, 0, 1], ["İç dış yıkama", "Yıkama", [400, 450, 550, 650], 35, 0, 0, 1], ["Motor yıkama", "Yıkama", [300, 300, 350, 400], 20, 0, 0, 1], ["Alt yıkama", "Yıkama", [200, 200, 250, 300], 10, 0, 0, 0],
  ["Detaylı iç temizlik", "İç temizlik", [1500, 1800, 2200, 2600], 150, 0, 0, 1], ["Koltuk yıkama", "İç temizlik", [900, 1000, 1200, 1400], 80, 0, 0, 0], ["Tavan / döşeme temizliği", "İç temizlik", [600, 700, 800, 900], 40, 0, 0, 0], ["Ozon / koku giderme", "İç temizlik", [400, 400, 500, 500], 20, 0, 0, 0],
  ["Pasta cila (tek aşama)", "Pasta cila", [2500, 3000, 3500, 4000], 300, 0, 0, 1], ["Pasta cila (üç aşama)", "Pasta cila", [4500, 5500, 6500, 7500], 500, 0, 0, 0], ["Far temizliği", "Pasta cila", [500, 500, 600, 600], 50, 0, 0, 0],
  ["Seramik kaplama (1 yıl)", "Seramik", [6000, 7000, 8500, 10000], 1500, 12, 6, 1], ["Seramik kaplama (3 yıl)", "Seramik", [10000, 12000, 14000, 16000], 2500, 36, 6, 0], ["Seramik bakımı", "Seramik", [1500, 1800, 2000, 2300], 200, 0, 6, 0],
  ["PPF ön paket (kaput, tampon, çamurluk)", "PPF", [18000, 20000, 24000, 28000], 7000, 60, 12, 0], ["PPF tam kaplama", "PPF", [60000, 70000, 85000, 100000], 25000, 60, 12, 0],
  ["Cam filmi (yan ve arka camlar)", "Cam filmi", [3500, 4000, 4500, 5000], 1200, 60, 0, 0], ["Cam filmi (tüm camlar)", "Cam filmi", [4500, 5000, 5500, 6000], 1500, 60, 0, 0]];
// [ad, satış, alış, stok, uyarı sınırı]
const ORNEK_URUN = [["Oto şampuanı 1 L", 250, 120, 10, 3], ["Cila / wax 500 ml", 450, 220, 6, 2], ["Mikrofiber bez", 120, 45, 20, 5], ["Lastik parlatıcı", 200, 90, 8, 2], ["Cam suyu 4 L", 150, 60, 12, 3], ["Oto kokusu", 90, 30, 30, 8]];
const ORNEK_PAKET = [{ad: "10 dış yıkama paketi", adet: 10, fiyat: 2500}, {ad: "10 iç dış yıkama paketi", adet: 10, fiyat: 4000}];
const GARANTI_SART = "Garanti, uygulanan ürün ve işçilik için geçerlidir. Kaza, darbe, yanlış yıkama (fırçalı otomatik yıkama, sert kimyasal) ve üçüncü kişilerin müdahalesi garanti dışıdır. Belirtilen bakımların yapılmaması garantiyi etkileyebilir. Başvuruda bu belge gösterilir.";
const PANELLER = ["Kaput", "Tavan", "Bagaj", "Ön tampon", "Arka tampon", "Sol ön çamurluk", "Sol ön kapı", "Sol arka kapı", "Sol arka çamurluk", "Sağ ön çamurluk", "Sağ ön kapı", "Sağ arka kapı", "Sağ arka çamurluk"];
const DURUM = {randevu: "Randevu", sira: "Sırada", islemde: "İşlemde", hazir: "Hazır", teslim: "Teslim edildi"};
const SONRAKI = {randevu: ["sira", "Geldi · sıraya al"], sira: ["islemde", "▶ Başla"], islemde: ["hazir", "✓ Hazır"], hazir: ["teslim", "Teslim et"]};
// ---------------------------------------------------------------- yardımcılar
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const tl = n => (Math.round((+n || 0) * 100) / 100).toLocaleString("tr-TR", {maximumFractionDigits: 2}) + " ₺";
const sayi = v => typeof v === "number" ? v : (parseFloat(String(v || "").replace(/\./g, "").replace(",", ".")) || 0);
const kucuk = s => String(s || "").toLocaleLowerCase("tr");
const yerel = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString();
const bugun = () => yerel(new Date()).slice(0, 10);
const gunEkle = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const tr = iso => iso ? iso.slice(0, 10).split("-").reverse().join(".") : "";
const saat = iso => iso ? iso.slice(11, 16) : "";
const AYLAR = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];
const AY_TAM = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUN_KISA = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const bas = ad => String(ad || "?").trim().split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toLocaleUpperCase("tr") || "?";
const renk = ad => "a" + ((String(ad || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 5) + 1);
const waNo = t => { let d = String(t || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "90" + d.slice(1); else if (d.length === 10) d = "90" + d; return d.length >= 12 ? d : ""; };
const A = () => Veri.M;
const odemeTurleri = () => Veri.ayar("odemeTurleri") || ["Nakit", "Kart", "EFT / Havale"];

function toast(t) { let e = $(".toast"); if (!e) { e = document.createElement("div"); e.className = "toast"; document.body.appendChild(e); } e.textContent = t; e.hidden = false; clearTimeout(toast.z); toast.z = setTimeout(() => e.remove(), 2800); }
function perde(html, baglan) {
  kapat();
  const d = document.createElement("div"); d.className = "perde"; d.innerHTML = `<div class="sayfa" role="dialog">${html}</div>`;
  d.addEventListener("click", e => { if (e.target === d) kapat(); });
  document.body.appendChild(d); if (baglan) baglan(d.firstChild); return d.firstChild;
}
function kapat() { document.querySelectorAll(".perde").forEach(x => x.remove()); }
document.addEventListener("keydown", e => { if (e.key === "Escape") kapat(); });
function onay(soru, evet, tehlike) {
  perde(`<h3>${esc(soru)}</h3><div class="ikili-g"><button class="btn ince" data-k>Vazgeç</button><button class="btn ${tehlike ? "ana" : "koyu"}" data-e>Evet</button></div>`, s => {
    s.querySelector("[data-k]").onclick = kapat; s.querySelector("[data-e]").onclick = () => { kapat(); evet(); }; });
}

// ---------------------------------------------------------------- PIN (cihazda; yalnız özeti saklanır)
async function pinOzet(pin, tuz) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const b = await crypto.subtle.deriveBits({name: "PBKDF2", hash: "SHA-256", salt: tuz, iterations: 150000}, k, 256);
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function pinKaydet(pin) {
  const tuz = crypto.getRandomValues(new Uint8Array(16));
  await Veri.ayarYaz("pin", {t: [...tuz], h: await pinOzet(pin, tuz), u: pin.length});
}
async function pinDogru(pin) { const p = Veri.ayar("pin"); return !!p && await pinOzet(pin, new Uint8Array(p.t)) === p.h; }

// ---------------------------------------------------------------- 1.2.0 personel: ortak telefonda herkes kendi şifresiyle girer
// Yönetici şifresi her personelin şifresiyle sarılı saklanır (yedekler hep yönetici şifresiyle kilitlenir). Yönetici şifresini değiştirince zincire eklenir.
const personeller = () => Veri.ayar("personel") || [];
const personelVar = () => personeller().length > 0;
const yon = () => !OTURUM.kim || OTURUM.kim.yon;
const YON_AD = "Yönetici";
const kimSu = () => OTURUM.kim || {id: "y", ad: YON_AD, yon: true};
async function sarAnahtar(pin, tuz) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode("oto-per|" + pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name: "PBKDF2", hash: "SHA-256", salt: tuz, iterations: 100000}, k, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]);
}
async function sar(metin, pin) { const tuz = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)); return {s: b64(tuz), iv: b64(iv), c: b64(new Uint8Array(await crypto.subtle.encrypt({name: "AES-GCM", iv}, await sarAnahtar(pin, tuz), new TextEncoder().encode(metin))))}; }
async function sarAc(o, pin) { try { return new TextDecoder().decode(await crypto.subtle.decrypt({name: "AES-GCM", iv: unb64(o.iv)}, await sarAnahtar(pin, unb64(o.s)), unb64(o.c))); } catch (e) { return null; } }
async function yoneticiPinBul(p, ppin) {
  let y = p.sar ? await sarAc(p.sar, ppin) : null, eski = false;
  for (let k = 0; y && k < 30 && !(await pinDogru(y)); k++) { let n = null; for (const z of Veri.ayar("ypZincir") || []) { n = await sarAc(z, y); if (n) break; } y = n; eski = true; }
  if (!y) return "";
  if (eski) { p.sar = await sar(y, ppin); await Veri.ayarYaz("personel", personeller().map(x => x.id === p.id ? p : x)); }
  return y;
}
async function girisBul(pin) {
  if (await pinDogru(pin)) return {kim: {id: "y", ad: YON_AD, yon: true}, yp: pin};
  for (const p of personeller()) if (p.pin && await pinOzet(pin, new Uint8Array(p.pin.t)) === p.pin.h) return {kim: {id: p.id, ad: p.ad, yon: false}, yp: await yoneticiPinBul(p, pin)};
  return null;
}
async function pinKullanimda(pin, haricId) {
  if (haricId !== "y" && await pinDogru(pin)) return true;
  for (const p of personeller()) if (p.id !== haricId && p.pin && await pinOzet(pin, new Uint8Array(p.pin.t)) === p.pin.h) return true;
  return false;
}

// ---------------------------------------------------------------- yedek (şifreli dosya)
async function yedekAnahtar(pin, tuz, giz) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode("oto-yedek|" + (giz ? giz + "|" : "") + pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name: "PBKDF2", hash: "SHA-256", salt: tuz, iterations: 200000}, k, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]);
}
const b64 = u => { let s = ""; for (const x of u) s += String.fromCharCode(x); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function yedekOlustur(giz) {
  const tuz = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const veri = new TextEncoder().encode(JSON.stringify(Veri.disaAl()));
  if (!OTURUM.pin) throw new Error("yönetici şifresi bu oturumda yok · yönetici bir kez girsin");
  const c = new Uint8Array(await crypto.subtle.encrypt({name: "AES-GCM", iv}, await yedekAnahtar(OTURUM.pin, tuz, giz), veri));
  return JSON.stringify({tur: "OtoDefteriYedekSifreli", v: 1, g: giz ? 1 : 0, tarih: new Date().toISOString(), isletme: Veri.ayar("isletmeAd") || "", hasta: A().hasta.length, islem: A().islem.length, s: b64(tuz), iv: b64(iv), c: b64(c)});
}
async function yedekCoz(metin, pin, giz) {
  let y; try { y = JSON.parse(metin); } catch (e) { throw new Error("Bu dosya Esnaf Oto Detay Mobil yedeği değil"); }
  if (y.tur !== "OtoDefteriYedekSifreli") throw new Error("Bu dosya Esnaf Oto Detay Mobil yedeği değil");
  try { return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name: "AES-GCM", iv: unb64(y.iv)}, await yedekAnahtar(pin, unb64(y.s), y.g ? giz : ""), unb64(y.c)))); }
  catch (e) { throw new Error("Şifre yanlış: yedek alındığı zamanki giriş şifresini yazın"); }
}
async function dosyaVer(ad, metin, tur) {
  const blob = new Blob([metin], {type: tur});
  try {
    const f = new File([blob], ad, {type: tur});
    if (navigator.canShare && navigator.canShare({files: [f]})) { await navigator.share({files: [f], title: ad}); return "paylasildi"; }
  } catch (e) { if (e && e.name === "AbortError") return "vazgecildi"; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return "indirildi";
}
async function yedekGonder() {
  const ad = `OtoDefteri-yedek-${bugun()}.txt`;          // 1.1.0: .txt — Android'in paylaş menüsü .kdy'yi kabul etmiyordu
  const s = await dosyaVer(ad, await yedekOlustur(), "text/plain");
  if (s !== "vazgecildi") { await Veri.ayarYaz("sonYedek", new Date().toISOString()); toast(s === "paylasildi" ? "Yedek gönderildi" : "Yedek dosyası indirildi"); ciz(); }
}

// ---------------------------------------------------------------- Google Drive yedeği
const googleBagli = () => !!(Veri.ayar("google") && Veri.ayar("google").giz);
async function driveYedekle(sessiz) {
  if (!googleBagli()) return false;
  if (sessiz && !Google.jetonVar()) return false;          // açılır pencere yalnız dokunuşla; sessizken jeton yoksa sonra
  try { await Google.jetonAl(sessiz); await Google.yedekYaz(await yedekOlustur(Veri.ayar("google").giz)); let fn = 0; try { fn = await fotoDriveEsitle(); } catch (e) { /* fotoğraf sonra */ } if (!sessiz) { toast("☁ Drive'a yedeklendi" + (fn ? ` · ${fn} fotoğraf` : "")); ciz(); } return true; }
  catch (e) { if (!sessiz) { if (e.izin) googleIzinPerde(); else toast("Drive'a yedeklenemedi: " + e.message); } return false; }
}
function driveGeriYukleSor(metin, sonra) {
  perde(`<h3>☁ Drive'daki yedeği geri yükle</h3><p class="kucuk">Bu telefondaki kayıtların YERİNE geçer.</p><label>Yedeğin şifresi (yedek alındığı zamanki giriş şifresi)<input class="girdi" id="dS" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><p class="hata" id="dH"></p><button class="btn ana" id="dK">Geri yükle</button><button class="btn ince" data-kapat>Vazgeç</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat; s.querySelector("#dS").focus();
    s.querySelector("#dK").onclick = async () => { const pin = s.querySelector("#dS").value;
      try { const y = await yedekCoz(metin, pin, Veri.ayar("google").giz); const g = Veri.ayar("google"); await Veri.iceAl(y); stokYenile(); await Veri.ayarYaz("google", g); await Veri.ayarYaz("sonDrive", new Date().toISOString()); OTURUM.pin = pin; OTURUM.acik = true; await pinKaydet(pin); await lisansTazele(false);
        await fotoYetimTemizle(); let fn = 0; try { fn = await fotoDriveGetir(); } catch (e) { /* fotoğraflar sonra */ }
        kapat(); toast(`Geri yüklendi · ${A().hasta.length} araç, ${A().islem.length} iş${fn ? ", " + fn + " fotoğraf" : ""}`); if (sonra) sonra(); else git("ana"); }
      catch (e) { s.querySelector("#dH").textContent = e.message; } }; });
}
async function googleBaglan(kurulumda) {
  try {
    toast("Google açılıyor…");
    const r = await Google.baglan();
    await lisansTazele(true);
    const f = await Google.yedekBilgi();
    if (f && (kurulumda || !A().islem.length)) { const m = await Google.yedekOku(); return driveGeriYukleSor(m); }
    if (kurulumda) { toast(`Bağlandı (${r.email}) · Drive'da yedek yok, yeni kurulum yapın`); return ciz(); }
    toast(`Bağlandı: ${r.email}${r.kodDegisti ? " · cihaz kodu Drive'dan geri geldi" : ""}`);
    await driveYedekle(false);
  } catch (e) { if (e.izin) googleIzinPerde(); else toast(e.message); }
}
// 1.2.1: Google ekranında "Drive" kutusu işaretlenmezse yedek yazılamaz (403) → ne yapılacağını söyle, tek dokunuşla yeniden iste
function googleIzinPerde() {
  perde(`<h3>Drive izni verilmedi</h3><p class="kucuk">Google ekranında <b>"Google Drive uygulama verilerini görme, oluşturma ve silme"</b> kutusu işaretlenmediği için yedek Drive'a yazılamadı.</p>
    <p class="kucuk">"Tekrar izin ver"e dokunun, Google ekranında o kutuyu işaretleyip <b>Devam</b>'a basın. Program yalnız kendi gizli klasörünü görür; Drive'daki diğer dosyalarınıza erişemez.</p>
    <button class="btn ana" id="gIz">Tekrar izin ver</button><button class="btn ince" data-kapat>Kapat</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    s.querySelector("#gIz").onclick = () => { kapat(); googleBaglan(false); }; });
}

// ---------------------------------------------------------------- ekip: birleştirme ekranları
async function ekipAc(metin, sifre) {
  sifre = sifre || Veri.ayar("ekipSifre");
  let y;
  try { if (!sifre) throw new Error("şifre"); y = await Ekip.ac(metin, sifre); }
  catch (e) {
    if (e.message !== "şifre" && !/şifresi yanlış/.test(e.message)) return toast(e.message);
    return perde(`<h3>Ekip şifresi</h3><p class="kucuk">${sifre ? "Bu dosya farklı bir ekip şifresiyle kilitlenmiş." : "Dosyayı açmak için ekipte kullandığınız ekip şifresini yazın."}</p><input class="girdi" id="eS" type="text" autocomplete="off" style="-webkit-text-security:disc"><p class="hata" id="eH"></p><button class="btn koyu" id="eK">Aç</button>`, s => {
      s.querySelector("#eS").focus();
      s.querySelector("#eK").onclick = async () => { const v = s.querySelector("#eS").value.trim(); try { await Ekip.ac(metin, v); if (!Veri.ayar("ekipSifre")) await Veri.ayarYaz("ekipSifre", v); kapat(); ekipAc(metin, v); } catch (er) { s.querySelector("#eH").textContent = er.message; } }; });
  }
  if (y.cihaz && y.cihaz === Veri.ayar("cihaz")) return toast("Bu dosya bu telefondan gönderilmiş · karşı telefonun dosyasını açın");
  const p = Ekip.plan(y), o = p.ozet, bos = !o.yeniHasta && !o.yeniIslem && !o.guncel && !o.yeniMalzeme && !o.silinen;
  perde(`<h3>Gelen defter · ${esc(y.isletme || "ekip")}</h3><p class="kucuk">Gönderen telefon ${esc(y.cihaz || "")} · ${tr(yerel(new Date(y.tarih)))} ${saat(yerel(new Date(y.tarih)))}</p>
    ${bos ? `<div class="kart bos-durum"><b>İki defter zaten aynı</b>Eklenecek ya da değişecek kayıt yok.</div>` : `<div class="kart ayar" style="padding:2px 14px">
      ${[["Yeni araç", o.yeniHasta], ["Yeni iş", o.yeniIslem], ["Güncellenen kayıt (ödeme, durum vb.)", o.guncel], ["Yeni hizmet / ürün", o.yeniMalzeme], ["Silinen kayıt", o.silinen]].filter(([, n]) => n).map(([t, n]) => `<div class="s"><div>${t}</div><b>${n}</b></div>`).join("")}</div>
    <p class="kucuk">Bu telefondaki kayıtlar silinmez. Aynı kayıtlar bir kez kalır; aynı kayıt iki telefonda değiştiyse son değişiklik geçer.</p>`}
    ${bos ? `<button class="btn ince" data-kapat>Kapat</button>` : `<button class="btn ana" id="bK">Birleştir</button><button class="btn ince" data-kapat>Vazgeç</button>`}`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    const b = s.querySelector("#bK"); if (b) b.onclick = async () => {
      b.disabled = true; b.textContent = "Birleştiriliyor…";
      try { await Ekip.uygula(p); stokYenile(); kapat(); toast(`Birleştirildi · ${o.yeniIslem} yeni iş, ${o.yeniHasta} yeni araç`); ciz(); kisiCiftleri(); driveYedekle(true); }
      catch (e) { b.disabled = false; b.textContent = "Birleştir"; toast("Birleştirilemedi: " + e.message); } };
  });
}
// ---------------------------------------------------------------- hesaplar
const islemler = () => A().islem.slice().sort((a, b) => b.ts.localeCompare(a.ts));
const hastaBul = id => A().hasta.find(h => h.id === id);
const hastaIslem = id => islemler().filter(i => i.hastaId === id);
const kalemYazi = i => (i.kalemler || []).map(k => k.ad + (k.hastadan ? " (müşterinin ürünü)" : "") + (k.adet > 1 ? " ×" + k.adet : "")).join(" · ");
const gunFark = (a, b) => Math.round((new Date(b.slice(0, 10) + "T12:00:00") - new Date(a.slice(0, 10) + "T12:00:00")) / 864e5);
const gunYazi = d => d === bugun() ? "bugün" : d === gunEkle(bugun(), 1) ? "yarın" : tr(d) + " " + GUNLER[new Date(d + "T12:00:00").getDay()];
const gunSaat = ts => (ts.startsWith(bugun()) ? "bugün" : tr(ts).slice(0, 5)) + " " + saat(ts);
const virgul = v => String(v).replace(".", ",");
const kisaYazi = i => { const k = i.kalemler || []; return k.slice(0, 3).map(x => x.ad).join(" + ") + (k.length > 3 ? " …" : ""); };
const borc = id => hastaIslem(id).filter(i => !i.odendi && i.durum !== "randevu").reduce((s, i) => s + i.toplam, 0);
const ayEkle = (iso, n) => { const d = new Date(iso.slice(0, 10) + "T12:00:00"); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
// plaka: "34abc123" → "34 ABC 123"; aramada boşluksuz karşılaştırılır
const plakaNorm = p => String(p || "").toLocaleUpperCase("tr").replace(/[^0-9A-ZÇĞİÖŞÜ]/g, "");
const plakaYaz = p => { const n = plakaNorm(p), m = n.match(/^(\d{2})([A-ZÇĞİÖŞÜ]{1,3})(\d{2,4})$/); return m ? `${m[1]} ${m[2]} ${m[3]}` : String(p || "").toLocaleUpperCase("tr").trim().replace(/\s+/g, " "); };
const plakaHtml = (p, k) => `<span class="plaka${k ? " k" : ""}"><i>TR</i>${esc(plakaYaz(p) || "—")}</span>`;
const aracAd = h => h ? plakaYaz(h.plaka) + (h.ad ? " · " + h.ad : "") : "Perakende satış";
const hizmetMi = m => !!m && m.tur === "hizmet";
const fiyatOf = (m, sinif) => hizmetMi(m) && Array.isArray(m.f) ? (+m.f[(+sinif || 2) - 1] || +m.f[0] || 0) : +m.satis || 0;
const fiyatAralik = m => { if (!hizmetMi(m) || !Array.isArray(m.f)) return tl(m.satis); const f = m.f.map(Number).filter(Boolean); if (!f.length) return tl(0); const a = Math.min(...f), b = Math.max(...f); return a === b ? tl(a) : tl(a).replace(" ₺", "") + "–" + tl(b); };
const bolumOf = kalemler => (kalemler || []).some(k => { const m = A().malzeme.find(x => x.id === k.malId); return DETAY_GRUP.includes((m && m.grup) || k.grup); }) ? "detay" : (kalemler || []).length && (kalemler || []).every(k => { const m = A().malzeme.find(x => x.id === k.malId); return m && !hizmetMi(m); }) ? "urun" : "yikama";
const calisanlar = () => [...new Set([...personeller().map(p => p.ad), ...(Veri.ayar("calisanlar") || [])])];
const paketler = () => Veri.ayar("paketler") || ORNEK_PAKET;
function stokUyarilari() {
  const t = bugun(), out = [];
  for (const m of A().malzeme) {
    if (m.stokTut && m.sinir > 0 && m.stok <= m.sinir) out.push({m, yazi: `${m.ad} ${m.stok} adet kaldı`, tur: "uy"});
    if (m.skt && m.skt.length >= 7 && m.skt.slice(0, 7) <= gunEkle(t, 60).slice(0, 7)) out.push({m, yazi: `${m.ad} son kullanma ${m.skt.slice(5, 7)}.${m.skt.slice(0, 4)}`, tur: "teh"});
  }
  return out;
}
// 1.1.0: stok = hareketlerin toplamı (birleştirmede iki telefonun düşüşü de doğru sayılır)
function stokYenile() { const t = {}; for (const h of A().hareket) t[h.malId] = (t[h.malId] || 0) + (+h.n || 0); for (const m of A().malzeme) m.stok = t[m.id] || 0; }
async function stokHareket(malId, n, tur, id, perAd) { const h = await Veri.kaydet("hareket", Object.assign({id: id || "", malId, n, tur, ts: yerel(new Date()).slice(0, 19)}, perAd ? {perAd} : {})); stokYenile(); return h; }
async function stokDegistir(kalemler, isaret, islemId) {
  if (isaret > 0) { for (const h of A().hareket.filter(h => h.id.startsWith(`i:${islemId}:`))) await Veri.sil("hareket", h.id); return stokYenile(); }      // işlem silindi: düşüş geri
  for (const [s, k] of (kalemler || []).entries()) {
    const m = A().malzeme.find(x => x.id === k.malId); if (!m || !m.stokTut || k.hastadan) continue;          // müşterinin getirdiği ürün stoktan düşmez
    await Veri.kaydet("hareket", {id: `i:${islemId}:${s}`, malId: k.malId, n: -k.adet, tur: "islem", ts: yerel(new Date()).slice(0, 19)});      // kimlik işleme ve sıraya bağlı: her telefonda aynı
  }
  stokYenile();
}

// ---------------------------------------------------------------- oturum, kilit, lisans
const OTURUM = {acik: false, pin: "", gizlendi: 0, durum: null, kim: null};
function izinVar(ne) {
  const d = OTURUM.durum;
  if (d && !d.acik) { toast(d.yaz + " · " + (ne || "yeni kayıt") + " yapılamaz"); return false; }
  return true;
}
async function lisansTazele(ag) {
  if (ag) await Lisans.listeAl();
  OTURUM.durum = await Lisans.durum();
  if (ag) Lisans.bildir(SURUM);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) OTURUM.gizlendi = Date.now();
  else if (OTURUM.acik && Date.now() - OTURUM.gizlendi > (Veri.ayar("kilitDk") || 2) * 60e3 && OTURUM.gizlendi) { OTURUM.acik = false; OTURUM.pin = ""; OTURUM.kim = null; kapat(); ciz(); }
  else if (OTURUM.acik) lisansTazele(true).then(ciz);
});

// ---------------------------------------------------------------- yönlendirme
const YOL = () => (location.hash || "#ana").slice(1).split("/");
window.addEventListener("hashchange", () => { kapat(); ciz(); });
const git = h => { if (location.hash === "#" + h) ciz(); else location.hash = h; };
const SVG = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const SIMGE = {ana: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  hastalar: '<path d="M4 16.5V12l2-5.2c.3-.8 1-1.3 1.9-1.3h8.2c.9 0 1.6.5 1.9 1.3L20 12v4.5"/><path d="M3 12h18v4.5H3z"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
  malzeme: '<path d="M3.5 12.5 11 5h7.5v7.5L11 20z"/><circle cx="15" cy="8.6" r="1.4"/>',
  kasa: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/>',
  ayarlar: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'};
const ALT = [["ana", "Ana sayfa"], ["hastalar", "Araçlar"], ["malzeme", "Hizmet · ürün"], ["kasa", "Kasa"], ["ayarlar", "Ayarlar"]];
const altCubuk = on => `<nav class="alt">${ALT.map(([k, t]) => `<button data-git="${k}" class="${on === k ? "on" : ""}"><i>${SVG(SIMGE[k])}</i>${t}</button>`).join("")}</nav>`;
function seritler() {
  const d = OTURUM.durum, out = [];
  if (d && !d.acik) out.push(`<div class="serit teh">🔒 ${esc(d.yaz)} · kayıtlarınız duruyor<button data-a="saticiya">Satıcıya yaz</button></div>`);
  else if (d && d.tur === "deneme" && d.kalan <= 2) out.push(`<div class="serit uy">${esc(d.yaz)}<button data-a="saticiya">Lisans al</button></div>`);
  if (d && d.duyuru) out.push(`<div class="serit ana">📣 ${esc(d.duyuru)}</div>`);
  const sy = Veri.ayar("sonYedek");
  const sd = Veri.ayar("sonDrive");
  if (googleBagli() && A().islem.length && (!sd || Date.now() - new Date(sd).getTime() > 20 * 3600e3)) out.push(`<div class="serit ana">☁ ${sd ? "Son Drive yedeği " + tr(yerel(new Date(sd))) : "Drive'a henüz yedek gitmedi"}<button data-a="driveYedek">Şimdi yedekle</button></div>`);
  if (A().islem.length && (!sy || Date.now() - new Date(sy).getTime() > 36 * 3600e3) && !googleBagli()) out.push(`<div class="serit uy">💾 ${sy ? "Son yedek " + tr(yerel(new Date(sy))) : "Henüz yedek almadınız"}<button data-a="yedek">Yedeği gönder</button></div>`);
  return out.join("");
}

// ---------------------------------------------------------------- çizim
function ciz() {
  const u = $("#uyg");
  if (!Veri.ayar("kurulum")) { u.innerHTML = kurulumEkrani(); return BAGLA.kurulum(u); }
  if (!OTURUM.acik) return kilitEkrani(u);
  if (OTURUM.durum && !OTURUM.durum.acik) return lisansEkrani(u);          // 1.1.0: lisanssız (deneme dışı) kullanım yok
  const [y, p] = YOL();
  const E = {ana: anaEkran, yeni: yeniEkran, satis: satisEkran, is: isEkran, hasta: hastaEkran, hastalar: hastalarEkran, malzeme: p ? malzemeEkran : malzemelerEkran, kasa: kasaEkran, ayarlar: ayarlarEkran}[y] || anaEkran;
  u.innerHTML = E(p);
  const b = u.querySelector("[data-baglan]"); if (b && BAGLA[b.dataset.baglan]) BAGLA[b.dataset.baglan](u, p);
}
const ust = (baslik, alt, sol, sag) => `<header class="ust">${sol ? `<button class="geri" data-a="geri" aria-label="Geri">‹</button>` : ""}<h1>${baslik}${alt ? `<small>${alt}</small>` : ""}</h1>${sag || ""}</header>`;

// 0 · kurulum
function kurulumEkrani() {
  return `<main class="ic" style="padding-top:calc(20px + env(safe-area-inset-top,0px));gap:12px" data-baglan="kurulum">
    <div class="logo">🚗</div><div style="text-align:center"><b style="font-size:22px">Esnaf Oto Detay Mobil</b><div class="kucuk">Hoş geldiniz · işletmenizi tanıtın</div></div>
    <label>İşletme adı<input class="girdi" id="kAd" autocomplete="organization" placeholder="Tabelada yazan ad"></label>
    <label>İşletme telefonu * <span style="font-weight:400">(fişte ve hatırlatmada görünür)</span><input class="girdi" id="kTel" type="tel" inputmode="tel" placeholder="Telefon numarası"></label>
    <div class="ikili-g"><label>Giriş şifresi (4–8 rakam)<input class="girdi" id="kPin" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc;letter-spacing:8px;text-align:center"></label>
      <label>Şifre (tekrar)<input class="girdi" id="kPin2" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc;letter-spacing:8px;text-align:center"></label></div>
    <div class="kart" style="display:grid;gap:8px"><div style="display:flex;gap:10px;align-items:center"><span class="av" style="background:#fff;border:1px solid var(--cizgi);color:#4285f4">G</span>
      <div style="flex:1"><b style="font-size:14px">Google ile bağla</b> <span class="et e-ana">isteğe bağlı</span><div class="kucuk">${GOOGLE_CLIENT_ID ? "Telefon değişse de lisansınız ve kayıtlarınız kaybolmaz: yedek kendi Drive'ınıza şifreli gider. Kurulumdan sonra Ayarlar'dan bağlarsınız." : "Yakında: telefon değişse de kayıtlarınız kaybolmasın diye Drive'a otomatik yedek. Ayarlar'dan bağlanacak."}</div></div></div></div>
    <div class="kart kucuk">🔒 Araç ve müşteri bilgileri yalnız bu cihazda tutulur (bilgisayar gerekmez). Program her gün yedeği kendinize (WhatsApp, Drive) göndermenizi hatırlatır.</div>
    <p class="hata" id="kHata"></p>
    <button class="btn ana" id="kGo">Başla</button>
    ${GOOGLE_CLIENT_ID ? `<button class="btn ince" data-a="googleKurulum">Daha önce kullandım · Google ile geri yükle</button>` : ""}
    <p class="kucuk" style="text-align:center">Sürüm ${SURUM}</p></main>`;
}
// kilit
const pinUzunluklari = () => [((Veri.ayar("pin") || {}).u || 4), ...personeller().map(p => (p.pin && p.pin.u) || 4)];
function kilitEkrani(u) {
  let pin = "";
  const UZ = Math.max(...pinUzunluklari()), KISA = Math.min(...pinUzunluklari());          // en uzun şifreye ulaşınca kendiliğinden dener; kısa şifreler ✓ ile
  const ciz2 = (h = "") => {
    u.innerHTML = `<main class="kilit"><div class="logo">🚗</div><div><b style="font-size:20px">${esc(Veri.ayar("isletmeAd") || "Esnaf Oto Detay Mobil")}</b><div class="kucuk">${personelVar() ? "Kendi şifrenizi yazın" : "Giriş şifrenizi yazın"}</div></div>
      <div class="pin">${[...Array(UZ).keys()].map(i => `<span class="${i < pin.length ? "d" : ""}"></span>`).join("")}</div><p class="hata">${esc(h)}</p>
      <div class="pin-tus">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-n="${n}">${n}</button>`).join("")}<button class="bos" data-a="unuttum" style="font-size:12px;color:var(--soluk)">Unuttum</button><button data-n="0">0</button><button class="bos" data-sil>⌫</button></div>${KISA < UZ ? `<button class="btn koyu" data-gir style="max-width:280px;margin-top:6px">✓ Giriş</button>` : ""}</main>`;
    const nokta = () => u.querySelectorAll(".pin span").forEach((s, i) => s.classList.toggle("d", i < pin.length));
    u.querySelectorAll("[data-n]").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); if (pin.length < UZ) { pin += b.dataset.n; nokta(); if (pin.length === UZ) dene(); } }));
    const gir = u.querySelector("[data-gir]"); if (gir) gir.addEventListener("pointerdown", e => { e.preventDefault(); if (pin.length >= 4) dene(); });
    u.querySelector("[data-sil]").addEventListener("pointerdown", e => { e.preventDefault(); pin = pin.slice(0, -1); nokta(); });
  };
  const dene = async () => {
    const y = Veri.ayar("yanlis") || {n: 0, t: 0};
    if (y.n >= 5 && Date.now() - y.t < 5 * 60e3) { pin = ""; return ciz2(`Çok fazla yanlış deneme · ${Math.ceil((5 * 60e3 - (Date.now() - y.t)) / 60e3)} dk sonra tekrar deneyin`); }
    const g = await girisBul(pin);
    if (g) { await Veri.ayarYaz("yanlis", {n: 0, t: 0}); OTURUM.acik = true; OTURUM.pin = g.yp; OTURUM.kim = g.kim; ciz(); if (personelVar()) toast("Hoş geldiniz · " + g.kim.ad); lisansTazele(true).then(ciz); return; }
    await Veri.ayarYaz("yanlis", {n: (y.n >= 5 ? 0 : y.n) + 1, t: Date.now()}); pin = ""; ciz2(y.n + 1 >= 4 ? "Şifre yanlış · son deneme" : "Şifre yanlış");
  };
  document.onkeydown = e => { if (OTURUM.acik) return; if (/^\d$/.test(e.key) && pin.length < UZ) { pin += e.key; ciz2(); if (pin.length === UZ) dene(); } else if (e.key === "Enter" && pin.length >= 4) dene(); else if (e.key === "Backspace") { pin = pin.slice(0, -1); ciz2(); } };
  ciz2();
}

// 1 · ana ekran: yıkama panosu (Sırada · İşlemde · Hazır)
function anaEkran() {
  const t = bugun(), L = A().islem, d = new Date(), su = stokUyarilari();
  const kasa = L.filter(i => i.odendi && (i.odemeTs || i.ts).startsWith(t)).reduce((s, i) => s + i.toplam, 0);
  const acik = L.filter(i => ["sira", "islemde", "hazir"].includes(i.durum));
  const alin = L.filter(i => !i.odendi && i.durum !== "randevu").reduce((s, i) => s + i.toplam, 0);
  const kol = k => acik.filter(i => i.durum === k).sort((a, b) => a.ts.localeCompare(b.ts));
  const rnd = L.filter(i => i.durum === "randevu" && (i.randevuTs || "").slice(0, 10) <= gunEkle(t, 1)).sort((a, b) => (a.randevuTs || "").localeCompare(b.randevuTs || ""));
  const teslim = L.filter(i => i.durum === "teslim" && (i.teslimTs || i.ts).startsWith(t)).sort((a, b) => (b.teslimTs || b.ts).localeCompare(a.teslimTs || a.ts));
  const saatG = d.getHours() < 12 ? "Günaydın" : d.getHours() < 18 ? "İyi günler" : "İyi akşamlar";
  const kim = personelVar() ? kimSu() : null;
  return `${ust(saatG + (kim && !kim.yon ? ", " + esc(kim.ad.split(" ")[0]) : ""), `${esc(Veri.ayar("isletmeAd") || "")} · ${GUNLER[d.getDay()]} ${d.getDate()} ${AY_TAM[d.getMonth()]}`, false, kim ? `<button class="yuv" data-a="kilitle" aria-label="Kişi değiştir" title="Kişi değiştir">${esc(bas(kim.ad))}</button>` : `<span class="yuv">${esc(bas(Veri.ayar("isletmeAd")))}</span>`)}
  ${seritler()}<main class="ic">
    <div class="kahraman"><small>Bugün kasa</small><b>${tl(kasa)}</b><div class="ikili"><span><b>${acik.length}</b> araç içeride</span><span><b>${teslim.length}</b> teslim</span><span><b>${tl(alin)}</b> alınacak</span></div></div>
    <div class="ikili-g"><button class="btn ana" data-git="yeni">＋ Araç al</button><button class="btn koyu" data-git="satis">🛒 Ürün sat</button></div>
    ${rnd.length ? `<div class="bas">📅 Randevular · bugün ve yarın</div><div class="kart liste">${rnd.map(i => { const h = hastaBul(i.hastaId), wa = h && waNo(h.tel), gun = i.randevuTs.slice(0, 10);
      return `<div class="s" data-git="is/${i.id}">${plakaHtml(h ? h.plaka : "", 1)}<div class="m"><b>${esc(gunYazi(gun))} ${saat(i.randevuTs)}${h && h.ad ? " · " + esc(h.ad) : ""}</b><small>${esc(kisaYazi(i))}</small></div>${gun <= t ? `<button class="cip on" data-durum="${i.id}" data-d="sira">Geldi</button>` : wa ? `<a class="t" href="https://wa.me/${wa}?text=${encodeURIComponent(randevuMetni(i))}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:21px;text-decoration:none" aria-label="Randevu hatırlatma">💬</a>` : ""}</div>`; }).join("")}</div>` : ""}
    <div class="pano">${[["sira", "Sırada"], ["islemde", "İşlemde"], ["hazir", "Hazır"]].map(([k, b]) => `<section class="pkol"><div class="bas">${b} <span class="say">${kol(k).length}</span></div>${kol(k).map(isKart).join("") || `<div class="kart bos-durum kucuk">${k === "sira" ? 'Sırada araç yok · "＋ Araç al"' : "Araç yok"}</div>`}</section>`).join("")}</div>
    ${(() => { const o = gunOzet(); return o.yik != null || o.bek != null || o.yogun ? `<div class="bas">Bugün</div><div class="uc"><div class="kart"><small>Ortalama yıkama</small><b>${o.yik != null ? o.yik + " dk" : "–"}</b></div><div class="kart"><small>Ortalama bekleme</small><b>${o.bek != null ? o.bek + " dk" : "–"}</b></div><div class="kart"><small>En yoğun saat</small><b>${o.yogun || "–"}</b></div></div>` : ""; })()}
    ${gelecekKart()}
    ${(() => { const L = ozlenenler(); return L.length ? `<div class="bas">💛 Sizi özledik · 30+ gün gelmeyenler<button data-git="hastalar" data-hfgit="ozledik" style="color:var(--ana);font-weight:600">${L.length > 5 ? "Tümü ›" : ""}</button></div><div class="kart liste">${L.slice(0, 5).map(ozledikSatir).join("")}</div>` : ""; })()}
    ${su.slice(0, 3).map(x => `<button class="kart" data-git="malzeme/${x.m.id}" style="display:flex;gap:10px;align-items:center;padding:12px 14px;text-align:left"><span class="et ${x.tur === "uy" ? "e-uy" : "e-teh"}">${x.tur === "uy" ? "Stok" : "SKT"}</span><span style="font-size:13.5px;flex:1">${esc(x.yazi)}</span><span style="color:var(--ana);font-weight:600;font-size:13px">Gör ›</span></button>`).join("")}
    <div class="bas">Bugün teslim edilenler<button data-git="kasa" style="color:var(--ana);font-weight:600">Kasa ›</button></div>
    ${teslim.length ? `<div class="kart liste">${teslim.slice(0, 15).map(satirIslem).join("")}</div>` : `<div class="kart bos-durum">Bugün henüz teslim yok.</div>`}
  </main>${altCubuk("ana")}`;
}
function isKart(i) {
  const h = hastaBul(i.hastaId), s = SONRAKI[i.durum], wa = h && waNo(h.tel);
  const bk = bekleme(i);
  return `<div class="kart iskart" data-git="is/${i.id}"><div class="ust2" style="justify-content:flex-start;gap:8px">${h ? aracResim(h.id) : ""}${plakaHtml(h ? h.plaka : "", 1)}<span class="kucuk" style="margin-left:auto">${i.durum === "hazir" ? saat(i.hazirTs || i.ts) : bk ? `<span class="${i.durum === "sira" && bk > 20 ? "et e-uy" : ""}">⏱ ${bk} dk</span>` : saat(i.ts)}${i.yikayan ? " · " + esc(i.yikayan) : ""}</span></div>
    <div class="isad">${esc(kisaYazi(i) || "—")}</div>
    <div class="alt2"><b>${tl(i.toplam)}</b>${i.odendi ? `<span class="et e-iyi">${i.toplam ? "ödendi" : i.kurId ? "paket" : "bedava"}</span>` : ""}<span style="flex:1"></span>
      ${i.durum === "hazir" && wa ? `<a class="cip" href="https://wa.me/${wa}?text=${encodeURIComponent(hazirMetni(i))}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="text-decoration:none">💬 Haber ver</a>` : ""}
      <button class="cip on" data-durum="${i.id}" data-d="${s[0]}">${s[1]}</button></div></div>`;
}
function satirIslem(i) {
  const h = hastaBul(i.hastaId);
  return `<div class="s" data-git="is/${i.id}">${h ? plakaHtml(h.plaka, 1) : `<span class="av a3">🛒</span>`}<div class="m"><b>${h ? esc(h.ad || plakaYaz(h.plaka)) : "Ürün satışı"}</b><small>${esc(kisaYazi(i))}${i.yikayan ? " · " + esc(i.yikayan) : ""}${i.odendi ? "" : ` · <span class="et e-uy">ödenmedi</span>`}</small></div><div class="t">${tl(i.toplam)}<small>${saat(i.teslimTs || i.ts)}</small></div></div>`;
}
const isletmeImza = () => `\n${Veri.ayar("isletmeAd") || ""}${Veri.ayar("isletmeTel") ? " · " + Veri.ayar("isletmeTel") : ""}`;
function hazirMetni(i) {
  const h = hastaBul(i.hastaId), sablon = Veri.ayar("hazirMesaj") || "Merhaba{ad}, {plaka} plakalı aracınız hazır. {tutar}Teşekkür ederiz.";
  return sablon.replace("{ad}", h && h.ad ? " " + h.ad : "").replace("{plaka}", h ? plakaYaz(h.plaka) : "").replace("{tutar}", i.odendi ? "" : "Ödenecek tutar: " + tl(i.toplam) + ". ") + isletmeImza();
}
const randevuMetni = i => { const h = hastaBul(i.hastaId); return `Merhaba${h && h.ad ? " " + h.ad : ""}, ${gunYazi(i.randevuTs.slice(0, 10))} saat ${saat(i.randevuTs)} için ${h ? plakaYaz(h.plaka) + " plakalı aracınızın " : ""}randevunuzu hatırlatırız (${kisaYazi(i)}).${isletmeImza()}`; };

// 2 · araç al (kabul)
const YENI_BOS = () => ({hastaId: "", plaka: "", ad: "", tel: "", sinif: 2, yeniArac: false, adet: {}, hastadan: {}, grup: "Sık", tutarElle: null, odeme: "Teslimde", yikayan: "", not: "", hasar: "",
  randevu: false, randevuTs: "", kurId: "", paketSat: -1, bedava: false, mikronAcik: false, mikron: {}, fotolar: []});
const YENI = YENI_BOS();
function yeniSifirla(hastaId) { Object.assign(YENI, YENI_BOS()); const h = hastaId && hastaBul(hastaId); if (h) { YENI.hastaId = h.id; YENI.sinif = +h.sinif || 2; } }
function yeniEkran(p) {
  if (p === "sifirla" || (p && p !== YENI.hastaId && hastaBul(p))) { yeniSifirla(p === "sifirla" ? "" : p); history.replaceState(null, "", "#yeni"); }
  const d = new Date();
  return `${ust("Araç al", tr(yerel(d)) + " · " + saat(yerel(d)), true)}<main class="ic" data-baglan="yeni"><div id="yeniIc">${yeniIc()}</div></main>`;
}
const fiyatKalem = (m, sinif, hd) => hd ? Math.max(0, fiyatOf(m, sinif) - (+m.alis || 0)) : fiyatOf(m, sinif);
const sinifSecici = () => `<div class="kucuk" style="font-weight:700">Araç sınıfı · fiyat buna göre</div><div class="cips">${siniflar().map((s, k) => `<button class="cip ${+YENI.sinif === k + 1 ? "on" : ""}" data-sinif="${k + 1}">${esc(s)}</button>`).join("")}</div>`;
function sadakatDurum(h) {
  const N = +Veri.ayar("sadakatAdet") || 0; if (!N || !h) return null;
  let n = 0; for (const i of hastaIslem(h.id).slice().reverse()) { if (i.durum === "randevu" || i.bolum !== "yikama") continue; if (i.bedava) n = 0; else if (i.toplam > 0 || i.kurId) n++; }
  return {n, N, hak: n >= N - 1};
}
function yeniToplam(h, kalemler) {
  if (YENI.tutarElle != null) return YENI.tutarElle;
  if (YENI.kurId || YENI.bedava) return 0;
  if (YENI.paketSat >= 0) return +(paketler()[YENI.paketSat] || {}).fiyat || 0;
  return (kalemler || []).reduce((s, k) => s + k.adet * k.fiyat, 0);
}
function malSatir(m, sinif) {
  const n = YENI.adet[m.id] || 0, hd = !!YENI.hastadan[m.id], ilac = hizmetMi(m) && +m.alis > 0 && DETAY_GRUP.includes(m.grup);
  return `<div class="mal"><div class="ad">${esc(m.ad)}<small>${tl(fiyatKalem(m, sinif, hd))}${hd ? " · yalnız işçilik" : ""}${!hizmetMi(m) && m.stokTut ? " · stok " + m.stok : ""}${m.garantiAy ? " · " + garYazi(m.garantiAy) + " garanti" : ""}</small>${n && ilac ? `<button class="cip ${hd ? "on" : ""}" data-hastadan="${m.id}" style="font-size:11.5px;padding:3px 10px;margin-top:5px;display:inline-block">${hd ? "Ürünü müşteri getirdi ✓" : "Ürünü müşteri mi getirdi?"}</button>` : ""}</div><div class="adet ${n ? "" : "sif"}"><button data-eksi="${m.id}" aria-label="Azalt">−</button><span class="n">${n}</span><button data-arti="${m.id}" aria-label="Artır">＋</button></div></div>`;
}
const garYazi = ay => ay % 12 === 0 ? ay / 12 + " yıl" : ay + " ay";
function yeniIc() {
  const h = hastaBul(YENI.hastaId);
  let giris = "", html = "";
  if (!h) {
    const q = plakaNorm(YENI.plaka), qd = YENI.plaka.replace(/\D/g, ""), qk = kucuk(YENI.plaka.trim());
    const es = YENI.plaka.trim().length >= 2 ? A().hasta.filter(x => (q.length >= 2 && plakaNorm(x.plaka).includes(q)) || (qd.length >= 4 && String(x.tel || "").replace(/\D/g, "").includes(qd)) || (qk.length >= 2 && kucuk(x.ad).includes(qk))).slice(0, 6) : [];
    giris = `<label>Plaka<input class="girdi plaka-girdi" id="yPlaka" value="${esc(YENI.plaka)}" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="34 ABC 123 · ya da müşteri adı / telefon"></label>`;
    if (YENI.yeniArac) html += `<div class="serit ana" style="margin:0">＋ Yeni araç: <b>${esc(plakaYaz(YENI.plaka))}</b><button data-hdegis>Değiştir</button></div>
      <div class="ikili-g"><label>Müşteri adı (isteğe bağlı)<input class="girdi" id="yAd" value="${esc(YENI.ad)}" autocomplete="off"></label><label>Telefon (isteğe bağlı)<input class="girdi" id="yTel" type="tel" inputmode="tel" value="${esc(YENI.tel)}" placeholder="hazır mesajı için"></label></div>`;
    else if (YENI.plaka.trim().length >= 2) html += `<div class="oneri">${es.map(x => { const s = hastaIslem(x.id)[0]; return `<button class="s" data-hsec="${x.id}" style="width:100%;text-align:left">${aracResim(x.id)}${plakaHtml(x.plaka, 1)}<div style="flex:1;min-width:0"><b>${esc(x.ad || "—")}</b><small>${esc(siniflar()[(+x.sinif || 2) - 1])}${x.tel ? " · " + esc(x.tel) : ""}${s ? " · son " + tr(s.ts) : ""}</small></div></button>`; }).join("")}
      ${q.length >= 4 && !A().hasta.some(x => plakaNorm(x.plaka) === q) ? `<button class="s" data-hyeni style="width:100%;text-align:left"><span class="av" style="background:var(--vurgu-acik);color:var(--yazi)">＋</span><div style="flex:1"><b>${esc(plakaYaz(YENI.plaka))} · yeni araç olarak ekle</b></div></button>` : ""}</div>`;
    if (!YENI.yeniArac) return giris + `<div id="yAlt">${html}<div class="bos-durum">Plakayı yazın. Araç daha önce geldiyse listeden seçin; paketi ve geçmişi görünür.</div></div>`;
  } else {
    html += `<div class="kart" style="display:flex;gap:10px;align-items:center;padding:10px 12px">${aracResim(h.id)}${plakaHtml(h.plaka)}<div style="flex:1;min-width:0"><b>${esc(h.ad || "Müşteri adı yok")}</b><small class="kucuk" style="display:block">${h.tel ? esc(h.tel) : "telefon yok"} · ${hastaIslem(h.id).filter(i => i.durum !== "randevu").length + 1}. geliş</small></div><button data-hdeg2 class="kucuk" style="color:var(--ana);font-weight:700">Değiştir</button></div>`;
    for (const k of (h.kurler || []).filter(k => !kurDurum(h, k).bitti)) { const d = kurDurum(h, k);
      html += YENI.kurId === k.id ? `<div class="serit iyi" style="margin:0">🎫 Paketten düşülecek: ${esc(k.ad)} · ${d.n + 1}. yıkama / ${k.toplam} · ücret alınmaz<button data-kurcik>Vazgeç</button></div>`
        : `<div class="serit ana" style="margin:0">🎫 ${esc(k.ad)} · kalan ${k.toplam - d.n} yıkama<button data-kursec="${k.id}">Paketten düş</button></div>`; }
    const sd = sadakatDurum(h);
    if (sd && sd.hak && !YENI.kurId) html += `<div class="serit uy" style="margin:0">🎁 Bu araç ${sd.N}. yıkamasında: bedava hakkı var<button data-bedava>${YENI.bedava ? "Bedava ✓ · geri al" : "Bedava yap"}</button></div>`;
    else if (sd) html += `<div class="kucuk">🎁 Sadakat: ${sd.n} / ${sd.N} yıkama</div>`;
  }
  html += sinifSecici();
  const M = A().malzeme, sinif = YENI.sinif, sik = M.filter(m => m.sik);
  const goster = YENI.grup === "Sık" ? (sik.length ? sik : M.slice(0, 10)) : M.filter(m => m.grup === YENI.grup);
  const secili = M.filter(m => YENI.adet[m.id] > 0 && !goster.includes(m));
  html += `<div class="cips">${["Sık", ...gruplar()].map(g => `<button class="cip ${YENI.grup === g ? "on" : ""}" data-grup="${esc(g)}">${g === "Sık" ? "Sık kullanılan" : esc(g)}</button>`).join("")}</div>
    <div class="kart" style="padding:4px 14px">${[...secili, ...goster].map(m => malSatir(m, sinif)).join("") || `<div class="bos-durum">Bu grupta hizmet yok. "Hizmet · ürün" ekranından ekleyin.</div>`}</div>`;
  html += yeniEkler(h);
  const kalemler = M.filter(m => YENI.adet[m.id] > 0).map(m => ({adet: YENI.adet[m.id], fiyat: fiyatKalem(m, sinif, !!YENI.hastadan[m.id])}));
  const top = yeniToplam(h, kalemler), kalem = kalemler.length;
  const odemeler = YENI.randevu ? ["Teslimde"] : ["Teslimde", ...odemeTurleri()];
  html += `<div class="toplam"><div><small>Toplam · ${kalem} kalem${YENI.tutarElle != null ? " · elle" : YENI.kurId ? " · paketten" : YENI.bedava ? " · bedava" : YENI.paketSat >= 0 ? " · paket satışı" : ""}</small><br><button data-tutar style="color:#fff"><b>${tl(top)}</b> <span style="font-size:12px;opacity:.7">✎</span></button></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:64%">${odemeler.map(o => `<button class="cip" data-odeme="${esc(o)}" style="${YENI.odeme === o ? "background:#fff;color:var(--yazi)" : "background:rgba(255,255,255,.12);color:#fff;box-shadow:none"}">${o === "Teslimde" ? "Teslimde ödenecek" : esc(o)}</button>`).join("")}</div></div>
    <button class="btn koyu" data-kaydet>${YENI.randevu ? "📅 Randevuyu kaydet" : "Sıraya al"}</button>`;
  return giris ? giris + `<div id="yAlt">${html}</div>` : html;
}
function yeniEkler(h) {
  let s = "";
  const cl = calisanlar();
  if (cl.length) s += `<div class="kucuk" style="font-weight:700">Yıkayan / usta</div><div class="cips">${["", ...cl].map(a => `<button class="cip ${YENI.yikayan === a ? "on" : ""}" data-yik="${esc(a)}">${a ? esc(a) : "Sonra seçilecek"}</button>`).join("")}</div>`;
  if (YENI.paketSat >= 0) s += `<div class="kart" style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><b>🎫 Paket sat</b><button data-paketsat style="color:var(--soluk);font-size:13px">✕ Vazgeç</button></div>
      <div class="cips">${paketler().map((p, k) => `<button class="cip ${YENI.paketSat === k ? "on" : ""}" data-pk="${k}">${esc(p.ad)} · ${tl(p.fiyat)}</button>`).join("")}</div>
      <p class="kucuk" style="margin:0">Paketin ücreti bugün alınır; bugünkü yıkama paketin 1.'si sayılır. Sonraki gelişlerde "Paketten düş" ile ücretsiz yazılır. Paketleri Ayarlar'dan değiştirebilirsiniz.</p></div>`;
  else if (!YENI.kurId && (h || YENI.yeniArac) && paketler().length) s += `<button class="btn ince" data-paketsat style="padding:10px;font-size:14.5px">🎫 Paket sat (ör. 10 yıkama)</button>`;
  if (YENI.mikronAcik || Object.keys(YENI.mikron).length) s += `<div class="kart" style="display:grid;gap:8px"><b>🎨 Boya kalınlığı (mikron) <span class="kucuk" style="font-weight:400">· boş bırakılabilir</span></b>${mikronTablo(YENI.mikron)}</div>`;
  else s += `<button class="btn ince" data-mikac style="padding:10px;font-size:14.5px">🎨 Boya kalınlığı ölç (pasta, PPF öncesi)</button>`;
  s += `<div class="ikili-g"><button class="btn ince" data-fotoekle style="padding:10px;font-size:14px">📷 Önce fotoğrafı${YENI.fotolar.length ? " · " + YENI.fotolar.length : ""}</button><button class="btn ince" data-randevuac style="padding:10px;font-size:14px">${YENI.randevu ? "📅 Randevu ✓" : "📅 Randevu ver"}</button></div>`;
  if (YENI.fotolar.length) s += `<div class="foto-izgara">${YENI.fotolar.map((b, k) => `<button class="foto" data-fotosil="${k}" title="Kaldır"><img src="${URL.createObjectURL(b)}" alt=""><span>✕</span></button>`).join("")}</div>`;
  if (YENI.randevu) s += `<label>Randevu günü ve saati<input class="girdi" type="datetime-local" id="yRandevu" value="${esc(YENI.randevuTs)}" min="${bugun()}T00:00"></label><p class="kucuk" style="margin-top:-6px">Araç o gün ana sayfadaki "Randevular"da görünür; bir gün önce WhatsApp'tan hatırlatabilirsiniz.</p>`;
  s += `<label>Hasar / dikkat notu<input class="girdi" id="yHasar" value="${esc(YENI.hasar)}" placeholder="ör. sağ arka kapıda çizik, jant kırık"></label>
    <label>Not<input class="girdi" id="yNot" value="${esc(YENI.not)}" placeholder="kısa not (isteğe bağlı)"></label>`;
  return s;
}
function mikronTablo(m) {
  m = m || {};
  return `<div class="mikron"><div class="mk-bas"><span>Parça</span><span>Önce</span><span>Sonra</span></div>${PANELLER.map(p => { const v = m[p] || ["", ""];
    return `<div class="mk-s"><span>${esc(p)}${+v[0] > 250 || +v[1] > 250 ? ` <i class="et e-uy">boyalı olabilir</i>` : ""}</span><input class="girdi" inputmode="numeric" data-mk="${esc(p)}" data-mi="0" value="${esc(v[0])}" aria-label="${esc(p)} önce"><input class="girdi" inputmode="numeric" data-mk="${esc(p)}" data-mi="1" value="${esc(v[1])}" aria-label="${esc(p)} sonra"></div>`; }).join("")}</div>
    <p class="kucuk" style="margin:0">Mikron (µm). Garanti belgesine basılır. 250 üstü genelde boyalı / macunlu parçadır.</p>`;
}
function mikronTemiz(m) { const o = {}; for (const [p, v] of Object.entries(m || {})) { const a = Math.round(sayi(v[0])) || "", b = Math.round(sayi(v[1])) || ""; if (a || b) o[p] = [a, b]; } return o; }
async function yeniKaydet() {
  if (!izinVar("araç kaydı")) return;
  let h = hastaBul(YENI.hastaId);
  if (!h) {
    if (!YENI.yeniArac) return toast("Plakayı yazın; listeden seçin ya da yeni araç olarak ekleyin");
    const p = plakaYaz(YENI.plaka); if (plakaNorm(p).length < 4) return toast("Plakayı yazın");
    h = A().hasta.find(x => plakaNorm(x.plaka) === plakaNorm(p)) || await Veri.kaydet("hasta", {plaka: p, ad: YENI.ad.trim(), tel: YENI.tel.trim(), sinif: +YENI.sinif || 2, marka: "", renk: "", not: "", ilk: yerel(new Date())});
  } else if (+h.sinif !== +YENI.sinif) { h.sinif = +YENI.sinif; await Veri.kaydet("hasta", h); }
  const kalemler = A().malzeme.filter(m => YENI.adet[m.id] > 0).map(m => { const hd = !!YENI.hastadan[m.id];
    return Object.assign({malId: m.id, ad: m.ad, grup: m.grup, adet: YENI.adet[m.id], fiyat: fiyatKalem(m, YENI.sinif, hd), alis: hd ? 0 : +m.alis || 0}, hd ? {hastadan: true} : {}, +m.garantiAy ? {garantiAy: +m.garantiAy} : {}, +m.bakimAy ? {bakimAy: +m.bakimAy} : {}); });
  if (!kalemler.length && YENI.paketSat < 0 && YENI.tutarElle == null) return toast("En az bir hizmet seçin");
  if (YENI.randevu && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(YENI.randevuTs || "")) return toast("Randevu gününü ve saatini seçin");
  const ts = yerel(new Date()).slice(0, 19);
  let kur = null, kurSira = 0;
  if (YENI.kurId) { kur = (h.kurler || []).find(k => k.id === YENI.kurId) || null; if (kur) kurSira = kurSeans(h.id, kur.id).length + 1; }
  else if (YENI.paketSat >= 0) { const p = paketler()[YENI.paketSat]; if (p) { kur = {id: Veri.yeniId(), ad: p.ad, toplam: +p.adet || 10, aralik: 0, pesin: true, fiyat: +p.fiyat || 0, basla: ts}; h.kurler = [...(h.kurler || []), kur]; await Veri.kaydet("hasta", h); kurSira = 1; } }
  const toplam = yeniToplam(h, kalemler), al = YENI.odeme !== "Teslimde" && !YENI.randevu;
  const i = await Veri.kaydet("islem", {hastaId: h.id, ts, durum: YENI.randevu ? "randevu" : "sira", ...(YENI.randevu ? {randevuTs: YENI.randevuTs.slice(0, 16)} : {}), kalemler, toplam, bolum: bolumOf(kalemler),
    odeme: al && toplam ? YENI.odeme : "", odendi: al || !toplam, ...(al || !toplam ? {odemeTs: ts} : {}), yikayan: YENI.yikayan, not: YENI.not.trim(), hasar: YENI.hasar.trim(),
    ...(Object.keys(mikronTemiz(YENI.mikron)).length ? {mikron: mikronTemiz(YENI.mikron)} : {}), ...(kur ? {kurId: kur.id, kurSira} : {}), ...(YENI.bedava ? {bedava: true} : {}),
    ...(personelVar() ? {per: kimSu().id, perAd: kimSu().ad} : {})});
  await stokDegistir(i.kalemler, -1, i.id);
  for (const b of YENI.fotolar) await fotoKaydet(i.id, "once", b);
  toast(`${plakaYaz(h.plaka)} · ${YENI.randevu ? "randevu " + tr(i.randevuTs) + " " + saat(i.randevuTs) : "sıraya alındı"}${kur ? ` · ${kur.ad} ${kurSira}/${kur.toplam}` : ""}`);
  yeniSifirla(); git("ana"); driveYedekle(true);
}

// ürün satışı (araçsız da olur)
const SATIS = {adet: {}, hastaId: "", q: "", odeme: ""};
function satisEkran() {
  const U = A().malzeme.filter(m => !hizmetMi(m)), h = hastaBul(SATIS.hastaId);
  const top = U.reduce((s, m) => s + (SATIS.adet[m.id] || 0) * (+m.satis || 0), 0), od = SATIS.odeme || odemeTurleri()[0] || "Nakit";
  return `${ust("Ürün sat", "Yıkama ürünleri, aksesuar", true)}<main class="ic" data-baglan="satis">
    <div class="kart" style="padding:4px 14px">${U.map(m => { const n = SATIS.adet[m.id] || 0; return `<div class="mal"><div class="ad">${esc(m.ad)}<small>${tl(m.satis)}${m.stokTut ? " · stok " + m.stok : ""}</small></div><div class="adet ${n ? "" : "sif"}"><button data-seksi="${m.id}" aria-label="Azalt">−</button><span class="n">${n}</span><button data-sarti="${m.id}" aria-label="Artır">＋</button></div></div>`; }).join("") || `<div class="bos-durum">Satılacak ürün yok. "Hizmet · ürün" ekranından "＋ Ürün" ile ekleyin.</div>`}</div>
    ${h ? `<div class="serit ana" style="margin:0">${esc(aracAd(h))}<button data-scik>Kaldır</button></div>` : `<label>Müşteri / plaka (isteğe bağlı · veresiye için gerekir)<input class="girdi" id="sAra" value="${esc(SATIS.q)}" autocomplete="off" placeholder="plaka ya da ad"></label><div id="sOneri">${satisOneri()}</div>`}
    <div class="toplam"><div><small>Toplam</small><br><b>${tl(top)}</b></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:64%">${[...odemeTurleri(), "Veresiye"].map(o => `<button class="cip" data-sod="${esc(o)}" style="${od === o ? "background:#fff;color:var(--yazi)" : "background:rgba(255,255,255,.12);color:#fff;box-shadow:none"}">${esc(o)}</button>`).join("")}</div></div>
    <button class="btn koyu" data-satkaydet>Satışı kaydet</button></main>${altCubuk("ana")}`;
}
function satisOneri() {
  const q = plakaNorm(SATIS.q), es = SATIS.q.trim().length >= 2 ? A().hasta.filter(x => plakaNorm(x.plaka).includes(q) || kucuk(x.ad).includes(kucuk(SATIS.q.trim()))).slice(0, 4) : [];
  return es.length ? `<div class="oneri">${es.map(x => `<button class="s" data-ssec="${x.id}" style="width:100%;text-align:left">${plakaHtml(x.plaka, 1)}<div style="flex:1"><b>${esc(x.ad || "—")}</b></div></button>`).join("")}</div>` : "";
}
async function satisKaydet() {
  if (!izinVar("satış")) return;
  const kalemler = A().malzeme.filter(m => !hizmetMi(m) && SATIS.adet[m.id] > 0).map(m => ({malId: m.id, ad: m.ad, grup: m.grup, adet: SATIS.adet[m.id], fiyat: +m.satis || 0, alis: +m.alis || 0}));
  if (!kalemler.length) return toast("En az bir ürün seçin");
  const od = SATIS.odeme || odemeTurleri()[0] || "Nakit", ver = od === "Veresiye";
  if (ver && !SATIS.hastaId) return toast("Veresiye için müşteriyi / plakayı seçin");
  const ts = yerel(new Date()).slice(0, 19), toplam = kalemler.reduce((s, k) => s + k.adet * k.fiyat, 0);
  const i = await Veri.kaydet("islem", {hastaId: SATIS.hastaId, ts, durum: "teslim", teslimTs: ts, kalemler, toplam, bolum: "urun", odeme: ver ? "" : od, odendi: !ver, ...(ver ? {} : {odemeTs: ts}), not: "", ...(personelVar() ? {per: kimSu().id, perAd: kimSu().ad} : {})});
  await stokDegistir(i.kalemler, -1, i.id);
  Object.assign(SATIS, {adet: {}, hastaId: "", q: ""}); toast(`Satış kaydedildi · ${tl(toplam)}`); git("ana"); driveYedekle(true);
}

// 3 · iş ayrıntısı
function isEkran(id) {
  const i = A().islem.find(x => x.id === id); if (!i) return `${ust("Kayıt bulunamadı", "", true)}<main class="ic"></main>${altCubuk("ana")}`;
  const h = hastaBul(i.hastaId), s = SONRAKI[i.durum], wa = h && waNo(h.tel), adim = ["sira", "islemde", "hazir", "teslim"], ak = adim.indexOf(i.durum);
  return `${ust(h ? esc(plakaYaz(h.plaka)) : "Ürün satışı", `${esc(DURUM[i.durum] || "")} · ${esc(gunSaat(i.ts))}${i.yikayan ? " · " + esc(i.yikayan) : ""}`, true)}
  <main class="ic" data-baglan="is">
    ${h ? `<button class="kart" data-git="hasta/${h.id}" style="display:flex;gap:10px;align-items:center;text-align:left;padding:10px 12px">${plakaHtml(h.plaka)}<div style="flex:1;min-width:0"><b>${esc(h.ad || "Müşteri adı yok")}</b><small class="kucuk" style="display:block">${esc(siniflar()[(+h.sinif || 2) - 1])}${h.tel ? " · " + esc(h.tel) : ""}</small></div><span class="ok">›</span></button>` : ""}
    ${i.durum === "randevu" ? `<div class="serit ana" style="margin:0">📅 Randevu: ${esc(gunYazi(i.randevuTs.slice(0, 10)))} ${saat(i.randevuTs)}</div>` : i.bolum === "urun" && !h ? "" : `<div class="adimlar">${["Sırada", "İşlemde", "Hazır", "Teslim"].map((t, k) => `<span class="${k < ak ? "gecti" : k === ak ? "simdi" : ""}">${t}</span>`).join("")}</div>`}
    ${s ? `<button class="btn ana" data-durum="${i.id}" data-d="${s[0]}">${s[1]}</button>` : ""}
    ${(i.durum === "hazir" || i.durum === "islemde") && wa ? `<a class="btn ince" href="https://wa.me/${wa}?text=${encodeURIComponent(hazirMetni(i))}" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">💬 "Aracınız hazır" mesajı</a>` : ""}
    ${i.durum === "randevu" && wa ? `<a class="btn ince" href="https://wa.me/${wa}?text=${encodeURIComponent(randevuMetni(i))}" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">💬 Randevuyu hatırlat</a>` : ""}
    <div class="kart liste">${(i.kalemler || []).map(k => `<div class="s" style="cursor:default"><div class="m"><b>${esc(k.ad)}</b><small>${k.hastadan ? "ürünü müşteri getirdi · yalnız işçilik" : k.adet + " × " + tl(k.fiyat)}${k.garantiAy ? " · " + garYazi(k.garantiAy) + " garanti" : ""}</small></div><div class="t">${tl(k.adet * k.fiyat)}</div></div>`).join("") || `<div class="bos-durum">Kalem yok</div>`}</div>
    <div class="toplam"><div><small>Toplam${i.kurId ? " · paket " + i.kurSira + ". yıkama" : i.bedava ? " · sadakat bedava" : ""}</small><br><b>${tl(i.toplam)}</b></div><span>${i.odendi ? (i.toplam ? esc(i.odeme || "Ödendi") + " ✓" : "Ücretsiz") : "Ödenmedi"}</span></div>
    ${!i.odendi && i.durum !== "randevu" ? `<div class="bas">Ödeme alındı</div><div class="cips">${odemeTurleri().map(o => `<button class="cip" data-isod="${esc(o)}">${esc(o)}</button>`).join("")}</div>` : ""}
    ${calisanlar().length && i.bolum !== "urun" ? `<div class="bas">Yıkayan / usta</div><div class="cips">${calisanlar().map(a => `<button class="cip ${i.yikayan === a ? "on" : ""}" data-isyik="${esc(a)}">${esc(a)}</button>`).join("")}</div>` : ""}
    ${i.bolum !== "urun" ? `<div class="kart" style="display:grid;gap:8px"><b>📷 Fotoğraflar</b><div id="fotoAlan" class="foto-izgara"><span class="kucuk">yükleniyor…</span></div>
      <div class="ikili-g"><button class="btn ince" data-isfoto="once" style="padding:10px">📷 Önce</button><button class="btn ince" data-isfoto="sonra" style="padding:10px">📷 Sonra</button></div>
      <p class="kucuk" style="margin:0">Fotoğraflar yalnız bu telefonda durur (yedeğe girmez). Dokunup WhatsApp'tan paylaşabilirsiniz.</p></div>` : ""}
    ${i.mikron || i.bolum === "detay" ? `<div class="kart" style="display:grid;gap:8px"><b>🎨 Boya kalınlığı (mikron)</b>${mikronTablo(i.mikron)}<button class="btn ince" data-mikkaydet style="padding:10px">Ölçümleri kaydet</button></div>` : ""}
    ${i.hasar || i.not ? `<div class="kart kucuk">${i.hasar ? "⚠ " + esc(i.hasar) : ""}${i.hasar && i.not ? "<br>" : ""}${i.not ? "📝 " + esc(i.not) : ""}</div>` : ""}
    ${i.garanti ? `<div class="kart" style="display:grid;gap:6px"><b>🛡 Garanti · ${esc(i.garanti.no)}</b>${i.garanti.kalemler.map(g => `<div class="kucuk">${esc(g.ad)} · ${garYazi(g.ay)} · bitiş <b>${tr(g.bitis)}</b>${g.bitis < bugun() ? ` <span class="et e-teh">bitti</span>` : ""}</div>`).join("")}<button class="btn ince" data-garanti="${i.id}" style="padding:10px">🛡 Garanti belgesini aç</button></div>` : ""}
    ${i.kontrol ? `<div class="kart kucuk" style="display:flex;align-items:center;gap:8px">🔔 ${esc(i.kontrolNot || "Bakım")}: ${esc(gunYazi(i.kontrol))}${i.kontrolKapandi ? " · kapatıldı" : `<button data-kontkapat="${i.id}" style="margin-left:auto;color:var(--ana);font-weight:700">Kapat</button>`}</div>` : ""}
    ${i.perAd ? `<div class="kucuk">Kaydeden: <b>${esc(i.perAd)}</b>${i.odemePerAd ? " · ödemeyi alan: <b>" + esc(i.odemePerAd) + "</b>" : ""}</div>` : ""}
    <div class="ikili-g"><button class="btn ince" data-fis="${i.id}" style="padding:10px">🧾 Fiş</button>${yon() ? `<button class="btn ince" data-issil="${i.id}" style="padding:10px;color:var(--tehlike)">Sil</button>` : ""}</div>
  </main>${altCubuk("ana")}`;
}
async function durumDegis(id, d) {
  const i = A().islem.find(x => x.id === id); if (!i || !izinVar("durum değişikliği")) return;
  if (d === "teslim") return teslimPerde(i);
  const ts = yerel(new Date()).slice(0, 19);
  i.durum = d; i[d + "Ts"] = ts; if (d === "sira" && i.randevuTs) i.ts = ts;
  await Veri.kaydet("islem", i);
  const h = hastaBul(i.hastaId);
  toast(`${h ? plakaYaz(h.plaka) : ""} · ${DURUM[d]}${d === "hazir" && h && waNo(h.tel) ? " · 💬 ile müşteriye haber verin" : ""}`); ciz();
}
function garantiKalemleri(i) { return (i.kalemler || []).filter(k => +k.garantiAy > 0).map(k => ({ad: k.ad, ay: +k.garantiAy, hastadan: !!k.hastadan})); }
async function garantiNo() { const y = bugun().slice(0, 4), s = Object.assign({}, Veri.ayar("garantiSayac") || {}); s[y] = (s[y] || 0) + 1; await Veri.ayarYaz("garantiSayac", s); const harf = String(Veri.ayar("cihaz") || "X").replace(/[^0-9A-Z]/gi, "").slice(0, 2).toUpperCase(); return `G${y}-${harf}-${String(s[y]).padStart(4, "0")}`; }
function teslimPerde(i) {
  const h = hastaBul(i.hastaId), gk = garantiKalemleri(i), bk = (i.kalemler || []).filter(k => +k.bakimAy > 0).sort((a, b) => b.bakimAy - a.bakimAy)[0];
  let od = i.odendi ? "" : (odemeTurleri()[0] || "Nakit");
  perde(`<h3>Teslim · ${h ? esc(plakaYaz(h.plaka)) : ""}</h3>
    <div class="toplam"><div><small>Toplam</small><br><b>${tl(i.toplam)}</b></div><span>${i.odendi ? (i.toplam ? esc(i.odeme || "Ödendi") + " ✓" : "Ücretsiz") : "Ödeme alınacak"}</span></div>
    ${i.odendi ? "" : `<div class="bas">Nasıl ödendi?</div><div class="cips" id="tOd">${[...odemeTurleri(), "Veresiye"].map(o => `<button class="cip ${o === od ? "on" : ""}" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div><p class="kucuk" style="margin:0">Veresiye: araç borçlu görünür, ödeyince araç kartından alınır.</p>`}
    ${gk.length ? `<div class="kart kucuk">🛡 Garanti belgesi oluşturulacak: ${gk.map(g => esc(g.ad) + " · " + garYazi(g.ay)).join(", ")}</div>` : ""}
    ${bk ? `<div class="kart kucuk">🔔 Bakım hatırlatması kurulacak: ${esc(bk.ad)} · ${bk.bakimAy} ay sonra (${tr(ayEkle(bugun(), bk.bakimAy))})</div>` : ""}
    <button class="btn ana" id="tK">Teslim et</button><button class="btn ince" data-kapat>Vazgeç</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    s.querySelectorAll("#tOd [data-o]").forEach(b => b.onclick = () => { od = b.dataset.o; s.querySelectorAll("#tOd [data-o]").forEach(x => x.classList.toggle("on", x === b)); });
    s.querySelector("#tK").onclick = async () => {
      const ts = yerel(new Date()).slice(0, 19);
      if (!i.odendi && od !== "Veresiye") Object.assign(i, {odendi: true, odeme: od, odemeTs: ts}, personelVar() ? {odemePer: kimSu().id, odemePerAd: kimSu().ad} : {});
      if (!i.odendi && od === "Veresiye" && !i.hastaId) return toast("Veresiye için araç gerekli");
      i.durum = "teslim"; i.teslimTs = ts;
      if (gk.length && !i.garanti) i.garanti = {no: await garantiNo(), bas: bugun(), kalemler: gk.map(g => Object.assign(g, {bitis: ayEkle(bugun(), g.ay)}))};
      if (bk && !i.kontrol) { i.kontrol = ayEkle(bugun(), +bk.bakimAy); i.kontrolNot = bk.ad.replace(/\s*\(.*\)$/, "") + " bakımı"; }
      await Veri.kaydet("islem", i); driveYedekle(true);
      const wa = h && waNo(h.tel);
      perde(`<h3>✓ Teslim edildi</h3><p class="kucuk">${h ? esc(aracAd(h)) + " · " : ""}${tl(i.toplam)} · ${i.odendi ? (i.toplam ? esc(i.odeme) : "ücretsiz") : "veresiye"}</p>
        ${i.garanti ? `<button class="btn koyu" data-gresim="${i.id}">🛡 Garanti belgesini resim olarak gönder</button><button class="btn ince" data-garanti="${i.id}">Belgeyi gör · ${esc(i.garanti.no)}</button>` : ""}
        <button class="btn ince" data-fis="${i.id}">🧾 Bilgi fişi</button>
        ${wa && Veri.ayar("googleYorum") ? `<a class="btn ince" href="https://wa.me/${wa}?text=${encodeURIComponent(yorumMetni(i))}" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">⭐ Google'da yorum iste</a>` : ""}
        ${wa ? `<a class="btn ince" href="https://wa.me/${wa}?text=${encodeURIComponent(tesekkurMetni(i))}" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">💬 Teşekkür mesajı${i.garanti ? " (garanti bilgisiyle)" : ""}</a>` : ""}
        <button class="btn ince" data-kapat>Kapat</button>`, s2 => { s2.querySelector("[data-kapat]").onclick = () => { kapat(); ciz(); };
          s2.querySelectorAll("[data-garanti]").forEach(b => b.onclick = () => garantiBelgesi(b.dataset.garanti)); s2.querySelectorAll("[data-gresim]").forEach(b => b.onclick = () => belgePaylas("garanti", i)); s2.querySelectorAll("[data-fis]").forEach(b => b.onclick = () => fisGoster(b.dataset.fis)); });
      ciz(); };
  });
}
function tesekkurMetni(i) {
  const h = hastaBul(i.hastaId);
  return `Merhaba${h && h.ad ? " " + h.ad : ""}, ${h ? plakaYaz(h.plaka) + " plakalı aracınızı" : "aracınızı"} teslim ettik, teşekkür ederiz.${i.garanti ? `\nGaranti belge no: ${i.garanti.no}\n${i.garanti.kalemler.map(g => `• ${g.ad}: ${garYazi(g.ay)} (bitiş ${tr(g.bitis)})`).join("\n")}` : ""}${i.kontrol ? `\nBakım zamanı: ${tr(i.kontrol)} (size hatırlatacağız)` : ""}${isletmeImza()}`;
}
const belgeBas = () => `<div class="b-ust"><b>${esc(Veri.ayar("isletmeAd") || "")}</b><span>${esc(Veri.ayar("isletmeTel") || "")}${Veri.ayar("isletmeAdres") ? " · " + esc(Veri.ayar("isletmeAdres")) : ""}</span></div>`;
function garantiHtml(i) {
  const h = hastaBul(i.hastaId) || {}, g = i.garanti, mk = Object.entries(i.mikron || {});
  const sart = Veri.ayar("garantiSart") || GARANTI_SART;
  return `<div class="belge">${belgeBas()}<h2>GARANTİ BELGESİ</h2>
    <table class="b-t"><tr><td>Belge no</td><td><b>${esc(g.no)}</b></td><td>Tarih</td><td>${tr(g.bas)}</td></tr><tr><td>Plaka</td><td><b>${esc(plakaYaz(h.plaka))}</b></td><td>Müşteri</td><td>${esc(h.ad || "")}</td></tr>${h.marka || h.renk ? `<tr><td>Araç</td><td colspan="3">${esc([h.marka, h.renk].filter(Boolean).join(" · "))}</td></tr>` : ""}</table>
    <table class="b-t"><tr><th>Uygulama</th><th>Süre</th><th>Bitiş</th></tr>${g.kalemler.map(k => `<tr><td>${esc(k.ad)}${k.hastadan ? "<br><small>Ürün müşteriye aittir; ürün garantisi verilmez, yalnız işçilik garantisi geçerlidir.</small>" : ""}</td><td>${garYazi(k.ay)}</td><td>${tr(k.bitis)}</td></tr>`).join("")}</table>
    ${mk.length ? `<table class="b-t"><tr><th>Boya kalınlığı (µm)</th><th>Önce</th><th>Sonra</th></tr>${mk.map(([p, v]) => `<tr><td>${esc(p)}</td><td>${v[0] || "—"}</td><td>${v[1] || "—"}</td></tr>`).join("")}</table>` : ""}
    ${i.kontrol ? `<p><b>Bakım:</b> ${esc(i.kontrolNot || "")} · ${tr(i.kontrol)}</p>` : ""}
    <p class="b-k">${esc(sart)}</p><div class="b-imza"><span>İşletme</span><span>Müşteri</span></div></div>`;
}
function garantiBelgesi(id) {
  const i = A().islem.find(x => x.id === id); if (!i || !i.garanti) return;
  const h = hastaBul(i.hastaId), wa = h && waNo(h.tel);
  perde(`<div class="belge-on">${garantiHtml(i)}</div><div class="ikili-g"><button class="btn koyu" id="gP">💬 Paylaş (WhatsApp vb.)</button><button class="btn ince" id="gK">⬇ Telefona kaydet</button></div>
    ${wa ? `<a class="btn ince" href="https://wa.me/${wa}?text=${encodeURIComponent(tesekkurMetni(i))}" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">💬 Yalnız yazı olarak gönder</a>` : ""}<button class="btn ince" data-kapat>Kapat</button>
    <p class="kucuk">Belge resim olarak gider; WhatsApp'ta doğrudan açılır.</p>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat; s.querySelector("#gP").onclick = () => belgePaylas("garanti", i); s.querySelector("#gK").onclick = () => belgePaylas("garanti", i, true); });
}
function fisHtml(i) {
  const h = hastaBul(i.hastaId);
  return `<div class="belge fis">${belgeBas()}<h2>BİLGİ FİŞİ</h2><p>${tr(i.teslimTs || i.ts)} ${saat(i.teslimTs || i.ts)}${h ? " · <b>" + esc(plakaYaz(h.plaka)) + "</b>" + (h.ad ? " · " + esc(h.ad) : "") : ""}</p>
    <table class="b-t">${(i.kalemler || []).map(k => `<tr><td>${esc(k.ad)}${k.adet > 1 ? " ×" + k.adet : ""}</td><td style="text-align:right">${tl(k.adet * k.fiyat)}</td></tr>`).join("")}<tr><th>TOPLAM</th><th style="text-align:right">${tl(i.toplam)}</th></tr></table>
    <p>${i.odendi ? (i.toplam ? "Ödeme: " + esc(i.odeme || "") : "Ücretsiz" + (i.kurId ? " (paket)" : "")) : "Ödenmedi"}</p><p class="b-k">Bu belge bilgi fişidir, mali değeri yoktur.</p></div>`;
}
function fisGoster(id) {
  const i = A().islem.find(x => x.id === id); if (!i) return;
  perde(`<div class="belge-on">${fisHtml(i)}</div><div class="ikili-g"><button class="btn koyu" id="fP">💬 Paylaş (WhatsApp vb.)</button><button class="btn ince" id="fK">⬇ Telefona kaydet</button></div><button class="btn ince" data-kapat>Kapat</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat; s.querySelector("#fP").onclick = () => belgePaylas("fis", i); s.querySelector("#fK").onclick = () => belgePaylas("fis", i, true); });
}
// fotoğraflar: telefonda küçültülür (1280 px), yalnız bu cihazda saklanır
async function fotoKucult(file) {
  const img = await new Promise((ok, no) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = no; im.src = u; });
  const k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return new Promise(ok => c.toBlob(ok, "image/jpeg", .8));
}
function fotoSec(cb) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.multiple = true;
  inp.onchange = async () => { for (const f of inp.files) { try { cb(await fotoKucult(f)); } catch (e) { toast("Fotoğraf okunamadı"); } } };
  inp.click();
}
const fotoKaydet = (isId, tur, blob) => Veri.fotoYaz({id: Veri.yeniId(), isId, tur, ts: yerel(new Date()).slice(0, 19), blob});
async function fotoAlanDoldur(u, i) {
  const el = u.querySelector("#fotoAlan"); if (!el) return;
  const L = (await Veri.fotolar()).filter(f => f.isId === i.id).sort((a, b) => a.ts.localeCompare(b.ts));
  el.innerHTML = L.length ? L.map(f => `<button class="foto" data-fgor="${f.id}"><img src="${URL.createObjectURL(f.blob)}" alt=""><span class="ftur">${f.tur === "sonra" ? "sonra" : "önce"}</span></button>`).join("") : `<span class="kucuk">Henüz fotoğraf yok</span>`;
  el.querySelectorAll("[data-fgor]").forEach(b => b.onclick = async () => { const f = L.find(x => x.id === b.dataset.fgor), h = hastaBul(i.hastaId);
    perde(`<img src="${URL.createObjectURL(f.blob)}" alt="" style="width:100%;border-radius:14px"><p class="kucuk">${f.tur === "sonra" ? "Sonra" : "Önce"} · ${esc(gunSaat(f.ts))}</p><button class="btn koyu" id="fP">Paylaş (WhatsApp vb.)</button><button class="btn ince" id="fS" style="color:var(--tehlike)">Fotoğrafı sil</button><button class="btn ince" data-kapat>Kapat</button>`, s => {
      s.querySelector("[data-kapat]").onclick = kapat;
      s.querySelector("#fP").onclick = async () => { const ad = `${h ? plakaNorm(h.plaka) : "arac"}-${f.tur}-${f.ts.slice(0, 10)}.jpg`, dosya = new File([f.blob], ad, {type: "image/jpeg"});
        try { if (navigator.canShare && navigator.canShare({files: [dosya]})) await navigator.share({files: [dosya], title: ad}); else { const a = document.createElement("a"); a.href = URL.createObjectURL(f.blob); a.download = ad; a.click(); } } catch (e) { /* vazgeçildi */ } };
      s.querySelector("#fS").onclick = () => onay("Fotoğraf silinsin mi?", async () => { await Veri.fotoSil(f.id); toast("Silindi"); ciz(); }, true); }); });
}

// 4 · araç kartı
function hastaEkran(id) {
  const h = hastaBul(id); if (!h) return `${ust("Araç bulunamadı", "", true)}<main class="ic"></main>${altCubuk("hastalar")}`;
  const is = hastaIslem(id).filter(i => i.durum !== "randevu"), od = is.filter(i => i.odendi).reduce((s, i) => s + i.toplam, 0), b = borc(id), wa = waNo(h.tel), sd = sadakatDurum(h), gar = is.filter(i => i.garanti);
  const tes = is.filter(i => i.durum === "teslim"), top = is.reduce((s, i) => s + i.toplam, 0), sonG = is[0], ilkG = is[is.length - 1];
  const aralik = is.length > 1 ? Math.round(gunFark(ilkG.ts, sonG.ts) / (is.length - 1)) : null, say = {};
  is.forEach(i => (i.kalemler || []).forEach(k => { say[k.ad] = (say[k.ad] || 0) + k.adet; })); const enCok = Object.entries(say).sort((a, b) => b[1] - a[1]).slice(0, 2);
  return `${ust(esc(plakaYaz(h.plaka)), [h.ad, h.tel, siniflar()[(+h.sinif || 2) - 1]].filter(Boolean).map(esc).join(" · "), true, `<button class="geri" data-hduz="${h.id}" aria-label="Düzenle">✎</button>`)}
  <main class="ic">${AFOTO.has(h.id) ? `<button class="arac-foto" data-aracfoto="${h.id}">${aracResim(h.id, "")}<span>📷 Araç resmini değiştir</span></button>` : `<button class="btn ince" data-aracfoto="${h.id}" style="padding:12px">📷 Araç resmi ekle · aracı resminden tanıyın</button>`}
    ${h.not ? `<div class="serit ana" style="margin:0">📝 ${esc(h.not)}</div>` : ""}
    <div class="ist"><div class="kart"><small>İlk kayıt</small><b>${h.ilk ? tr(h.ilk) : "–"}</b></div><div class="kart"><small>Son geliş</small><b>${sonG ? (sonG.ts.startsWith(bugun()) ? "bugün" : gunFark(sonG.ts, bugun()) + " gün önce") : "–"}</b></div>
      <div class="kart"><small>Toplam harcama</small><b>${tl(top)}</b></div><div class="kart"><small>Ortalama geliş</small><b>${aralik != null ? (aralik ? aralik + " günde bir" : "aynı gün") : "–"}</b></div></div>
    ${enCok.length || h.marka || h.renk ? `<div class="kart kucuk">${enCok.length ? "⭐ En çok: " + enCok.map(([k, n]) => esc(k) + " (" + n + ")").join(" · ") : ""}${h.marka || h.renk ? `${enCok.length ? " · " : ""}🚗 ${esc([h.marka, h.renk].filter(Boolean).join(" · "))}` : ""}</div>` : ""}
    <div class="uc"><div class="kart"><small>Geliş</small><b>${is.length}</b></div><div class="kart"><small>Ödenen</small><b>${tl(od)}</b></div><div class="kart"><small>Borç</small><b style="color:${b ? "var(--uyari)" : "var(--iyi)"}">${tl(b)}</b></div></div>
    <div style="display:flex;gap:8px"><button class="btn ana" data-git="yeni/${h.id}" style="flex:1;padding:12px;font-size:15px">＋ Araç al</button>
      ${wa ? `<a class="btn ince" href="https://wa.me/${wa}" target="_blank" rel="noopener" style="width:auto;padding:12px 16px;text-decoration:none">💬</a><a class="btn ince" href="tel:${esc(h.tel)}" style="width:auto;padding:12px 16px;text-decoration:none">☎</a>` : ""}</div>
    ${b ? `<button class="btn ince" data-borcode="${h.id}" style="padding:10px">Borcu tahsil et · ${tl(b)}</button>` : ""}
    ${kontrolSerit(h)}${paketKart(h)}
    ${sd ? `<div class="kart kucuk">🎁 Sadakat: <b>${sd.n} / ${sd.N}</b> yıkama${sd.hak ? " · sıradaki yıkama bedava" : ""}</div>` : ""}
    ${gar.length ? `<div class="bas">Garantiler</div><div class="kart liste">${gar.map(i => { const son = i.garanti.kalemler.map(g => g.bitis).sort().pop(); return `<div class="s" data-garanti2="${i.id}"><div class="m"><b>${esc(i.garanti.no)} · ${esc(i.garanti.kalemler.map(g => g.ad).join(", "))}</b><small>bitiş ${tr(son)}</small></div><span class="et ${son < bugun() ? "e-teh" : "e-iyi"}">${son < bugun() ? "bitti" : "geçerli"}</span></div>`; }).join("")}</div>` : ""}
    <div class="bas">Geçmiş · ${is.length} iş${tes.length !== is.length ? " · " + tes.length + " teslim" : ""}</div>
    ${is.length ? `<div class="kart zaman">${is.map(i => `<button class="g" data-git="is/${i.id}" style="text-align:left;width:100%"><div class="tar"><b>${i.ts.slice(8, 10)}</b><small>${AYLAR[+i.ts.slice(5, 7) - 1]}${i.ts.slice(0, 4) !== bugun().slice(0, 4) ? " " + i.ts.slice(2, 4) : ""}</small></div><div class="d"><b>${esc(kisaYazi(i) || "İş")}</b><p>${esc(DURUM[i.durum] || "")}${i.yikayan ? " · " + esc(i.yikayan) : ""}${i.kurId ? " · 🎫 paket " + i.kurSira + ". yıkama" : ""}${i.bedava ? " · 🎁 bedava" : ""}${i.garanti ? " · 🛡 " + esc(i.garanti.no) : ""}</p><div class="tut">${tl(i.toplam)} · ${i.odendi ? (i.toplam ? esc(i.odeme || "ödendi") : "ücretsiz") : `<span class="et e-uy">ödenmedi</span>`}</div></div></button>`).join("")}</div>` : `<div class="kart bos-durum">Henüz iş yok.</div>`}
  </main>${altCubuk("hastalar")}`;
}
function paketKart(h) {
  return (h.kurler || []).map(k => { const d = kurDurum(h, k);
    if (d.bitti && (!d.son || gunFark(d.son.ts, bugun()) > 60)) return "";
    return `<div class="kart" style="display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>🎫 ${esc(k.ad)}</b><span class="et ${d.bitti ? "e-iyi" : "e-ana"}">${d.bitti ? (k.kapandi && d.n < k.toplam ? "kapatıldı · " : "bitti · ") : ""}${d.n} / ${k.toplam}</span></div>
      <div class="nokta">${[...Array(Math.min(k.toplam, 30))].map((_, j) => `<i class="${j < d.n ? "d" : ""}"></i>`).join("")}</div>
      <div class="kucuk">${k.fiyat ? tl(k.fiyat) + " peşin alındı · " : ""}${d.bitti ? "paket bitti" : "kalan " + (k.toplam - d.n) + " yıkama"}${d.son ? " · son " + gunSaat(d.son.ts) : ""}</div>
      ${d.bitti ? "" : `<button class="btn ana" data-kurseans="${k.id}" data-h="${h.id}" style="padding:10px;font-size:14px">＋ Paketten yıkama al</button>${yon() ? `<button class="kucuk" data-kurbitir="${k.id}" data-h="${h.id}" style="color:var(--soluk);justify-self:start">Paketi kapat</button>` : ""}`}</div>`; }).join("");
}
function hastaDuzenle(id) {
  const h = id ? hastaBul(id) : {plaka: "", ad: "", tel: "", marka: "", renk: "", sinif: 2, not: ""};
  let sinif = +h.sinif || 2;
  perde(`<h3>${id ? "Araç bilgileri" : "Yeni araç"}</h3>
    <label>Plaka<input class="girdi plaka-girdi" id="hPlaka" value="${esc(h.plaka)}" autocapitalize="characters"></label>
    <div class="ikili-g"><label>Müşteri adı<input class="girdi" id="hAd" value="${esc(h.ad)}"></label><label>Telefon<input class="girdi" id="hTel" type="tel" inputmode="tel" value="${esc(h.tel)}"></label></div>
    <div class="ikili-g"><label>Marka / model<input class="girdi" id="hMarka" value="${esc(h.marka)}" placeholder="ör. Fiat Egea"></label><label>Renk<input class="girdi" id="hRenk" value="${esc(h.renk)}"></label></div>
    <div class="kucuk" style="font-weight:700">Araç sınıfı</div><div class="cips" id="hSin">${siniflar().map((s, k) => `<button class="cip ${sinif === k + 1 ? "on" : ""}" data-s="${k + 1}">${esc(s)}</button>`).join("")}</div>
    <label>Kalıcı not<textarea class="girdi" id="hNot" placeholder="ör. jantlara asitli ürün kullanılmayacak">${esc(h.not)}</textarea></label>
    <button class="btn koyu" id="hKaydet">Kaydet</button>${id && yon() ? `<button class="btn ince" id="hSil" style="color:var(--tehlike)">Aracı sil</button>` : ""}<button class="btn ince" data-kapat>Vazgeç</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    s.querySelectorAll("#hSin [data-s]").forEach(b => b.onclick = () => { sinif = +b.dataset.s; s.querySelectorAll("#hSin [data-s]").forEach(x => x.classList.toggle("on", x === b)); });
    s.querySelector("#hKaydet").onclick = async () => {
      const v = k => s.querySelector("#" + k).value.trim(), p = plakaYaz(v("hPlaka"));
      if (plakaNorm(p).length < 4) return toast("Plakayı yazın");
      if (A().hasta.some(x => x.id !== id && plakaNorm(x.plaka) === plakaNorm(p))) return toast("Bu plaka kayıtlı");
      if (!izinVar(id ? "araç düzenleme" : "yeni araç")) return;
      const o = Object.assign(h, {plaka: p, ad: v("hAd"), tel: v("hTel"), marka: v("hMarka"), renk: v("hRenk"), sinif, not: v("hNot")}); if (!o.ilk) o.ilk = yerel(new Date());
      await Veri.kaydet("hasta", o); kapat(); toast("Kaydedildi"); id ? ciz() : git("hasta/" + o.id); };
    const sl = s.querySelector("#hSil"); if (sl) sl.onclick = () => izinVar("silme") && onay(`${plakaYaz(h.plaka)} ve ${hastaIslem(id).length} işi silinsin mi? Geri alınamaz.`, async () => {
      for (const i of hastaIslem(id)) { await stokDegistir(i.kalemler, +1, i.id); await Veri.sil("islem", i.id); }
      await Veri.sil("hasta", id); toast("Araç silindi"); git("hastalar"); }, true);
  });
}
function borcTahsil(id) {
  const h = hastaBul(id), L = hastaIslem(id).filter(i => !i.odendi && i.durum !== "randevu"), b = L.reduce((s, i) => s + i.toplam, 0);
  perde(`<h3>Borç tahsili · ${esc(plakaYaz(h.plaka))}</h3><p class="kucuk">${L.length} ödenmemiş iş · toplam ${tl(b)}. Seçtiğiniz ödeme türüyle hepsi ödendi sayılır.</p>
    <div class="cips">${odemeTurleri().map(o => `<button class="cip" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div><button class="btn ince" data-kapat>Vazgeç</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    s.querySelectorAll("[data-o]").forEach(x => x.onclick = async () => { if (!izinVar("ödeme kaydı")) return; const ts = yerel(new Date()).slice(0, 19);
      for (const i of L) { Object.assign(i, {odendi: true, odeme: x.dataset.o, odemeTs: ts}, personelVar() ? {odemePer: kimSu().id, odemePerAd: kimSu().ad} : {}); await Veri.kaydet("islem", i); }
      kapat(); toast(`${tl(b)} tahsil edildi`); ciz(); }); });
}

// 5 · araçlar
const HF = {q: "", f: "hepsi"};
function hastalarEkran() {
  return `${ust("Araçlar", A().hasta.length + " kayıt", false, `<button class="yuv" style="background:var(--vurgu);color:var(--yazi)" data-hyenikart aria-label="Yeni araç">＋</button>`)}
  ${seritler()}<main class="ic" data-baglan="hastalar"><label class="ara">⌕ <input id="hAra" value="${esc(HF.q)}" placeholder="Plaka, ad ya da telefon" autocomplete="off"></label>
    <div class="cips">${[["hepsi", "Hepsi"], ["hafta", "Bu hafta gelen"], ["ozledik", "30+ gün gelmeyen"], ["borc", "Borcu olan"], ["paket", "Paketi olan"], ["garanti", "Garantisi süren"]].map(([k, t]) => `<button class="cip ${HF.f === k ? "on" : ""}" data-hf="${k}">${t}${k === "borc" ? " · " + A().hasta.filter(h => borc(h.id) > 0).length : ""}</button>`).join("")}</div>
    <div id="hListe">${hastaListe()}</div></main>${altCubuk("hastalar")}`;
}
function hastaListe() {
  if (HF.f === "ozledik") { const L = ozlenenler().filter(x => !HF.q.trim() || plakaNorm(x.h.plaka).includes(plakaNorm(HF.q)) || kucuk(x.h.ad).includes(kucuk(HF.q.trim())));
    return L.length ? `<p class="kucuk" style="margin:0 4px">30 günden uzun gelmeyen araçlar. 💬 ile "sizi özledik" mesajı gider; gönderdiğiniz araç 14 gün listede görünmez.</p><div class="kart liste">${L.map(ozledikSatir).join("")}</div>` : `<div class="kart bos-durum">30 günden uzun gelmeyen araç yok.</div>`; }
  const q = plakaNorm(HF.q), qk = kucuk(HF.q.trim()), qd = HF.q.replace(/\D/g, ""), hafta = gunEkle(bugun(), -7), t = bugun();
  const L = A().hasta.map(h => { const is = hastaIslem(h.id).filter(i => i.durum !== "randevu"); return {h, s: (is[0] || {}).ts || "", b: borc(h.id), n: is.length, od: is.filter(i => i.odendi).reduce((s, i) => s + i.toplam, 0), pk: (h.kurler || []).some(k => !kurDurum(h, k).bitti), gr: is.some(i => i.garanti && i.garanti.kalemler.some(g => g.bitis >= t))}; })
    .filter(x => (!HF.q.trim() || plakaNorm(x.h.plaka).includes(q) || kucuk(x.h.ad).includes(qk) || (qd.length >= 3 && String(x.h.tel || "").replace(/\D/g, "").includes(qd)))
      && (HF.f === "hepsi" || (HF.f === "hafta" && x.s >= hafta) || (HF.f === "borc" && x.b > 0) || (HF.f === "paket" && x.pk) || (HF.f === "garanti" && x.gr)))
    .sort((a, b) => (b.s || b.h.ilk || "").localeCompare(a.s || a.h.ilk || ""));
  if (!L.length) return `<div class="kart bos-durum">${A().hasta.length ? "Eşleşen araç yok." : "<b>Henüz araç yok</b>İlk aracı \"＋ Araç al\" ile aldığınızda kendiliğinden eklenir."}</div>`;
  return `<div class="kart liste">${L.slice(0, 300).map(x => `<div class="s" data-git="hasta/${x.h.id}">${aracResim(x.h.id)}${plakaHtml(x.h.plaka, 1)}<div class="m"><b>${esc(x.h.ad || "—")}</b><small>${x.s ? (x.s.startsWith(t) ? "Bugün" : x.s.startsWith(gunEkle(t, -1)) ? "Dün" : tr(x.s)) : "iş yok"} · ${x.n} geliş${x.pk ? " · 🎫 paket" : ""}${x.gr ? " · 🛡" : ""}${x.b ? ` · <span class="et e-uy">${tl(x.b)} borç</span>` : ""}</small></div><div class="t">${tl(x.od)}</div></div>`).join("")}</div>`;
}

// 6-7 · hizmet ve ürün listesi
const MF = {q: "", g: "Hepsi"};
function malzemelerEkran() {
  const M = A().malzeme, deger = M.filter(m => !hizmetMi(m) && m.stokTut).reduce((s, m) => s + (+m.stok || 0) * (+m.alis || 0), 0), n = siparisAdaylari().length;
  return `${ust("Hizmet · ürün", `${M.filter(hizmetMi).length} hizmet · ${M.filter(m => !hizmetMi(m)).length} ürün${yon() ? " · stok değeri " + tl(deger) : ""}`)}
  ${seritler()}<main class="ic" data-baglan="malzemeler"><label class="ara">⌕ <input id="mAra" value="${esc(MF.q)}" placeholder="Hizmet ya da ürün ara" autocomplete="off"></label>
    ${yon() ? `<div class="ikili-g"><button class="btn ince" data-git="malzeme/yeni" style="padding:10px">＋ Hizmet</button><button class="btn ince" data-git="malzeme/yeniurun" style="padding:10px">＋ Ürün</button></div>` : ""}
    <button class="btn ince" data-a="siparis" style="padding:10px">📋 Tedarikçiye sipariş listesi${n ? ` · <b style="color:var(--uyari)">${n} ürün azaldı</b>` : ""}</button>
    <div class="cips">${["Hepsi", ...gruplar(), "🎫 Paketler"].map(g => `<button class="cip ${MF.g === g ? "on" : ""}" data-mg="${esc(g)}">${esc(g)}</button>`).join("")}</div>
    <div id="mListe">${malzemeListe()}</div></main>${altCubuk("malzeme")}`;
}
function malzemeListe() {
  if (MF.g === "🎫 Paketler") { const P = paketler(), aktif = ad => A().hasta.filter(h => (h.kurler || []).some(k => k.ad === ad && !kurDurum(h, k).bitti)).length;
    return `<p class="kucuk" style="margin:0 4px">Müşteri paketi peşin alır; her gelişte "Paketten düş" ile o yıkama ücretsiz yazılır. Araç alırken "🎫 Paket sat" ile satılır.</p>
      <div class="kart liste">${P.map(p => `<div class="s" style="cursor:default"><div class="m"><b>${esc(p.ad)}</b><small>${p.adet} yıkama · ${tl(p.fiyat)} · ${aktif(p.ad)} araçta devam ediyor</small></div></div>`).join("") || `<div class="bos-durum">Tanımlı paket yok</div>`}</div>
      ${yon() ? `<button class="btn ince" data-a="paketler" style="padding:10px">✎ Paketleri düzenle / ＋ paket ekle</button>` : ""}`; }
  const q = kucuk(MF.q.trim()), L = A().malzeme.filter(m => (MF.g === "Hepsi" || m.grup === MF.g) && (!q || kucuk(m.ad).includes(q)));
  if (!L.length) return `<div class="kart bos-durum">${A().malzeme.length ? "Eşleşen kayıt yok." : "<b>Liste boş</b>＋ ile ilk hizmeti ekleyin."}</div>`;
  return `<div class="kart" style="padding:4px 14px">${[...gruplar(), ...[...new Set(A().malzeme.map(m => m.grup))].filter(g => !gruplar().includes(g))].map(g => { const gl = L.filter(m => m.grup === g).sort((a, b) => a.ad.localeCompare(b.ad, "tr")); return gl.length ? `<div class="kat">${esc(g.toLocaleUpperCase("tr"))}</div>` + gl.map(m => {
    const az = !hizmetMi(m) && m.stokTut && m.sinir > 0 && m.stok <= m.sinir;
    return `<button class="mal" data-git="malzeme/${m.id}" style="width:100%;text-align:left"><div class="ad">${esc(m.ad)}<small>${hizmetMi(m) ? "Hizmet" + (m.garantiAy ? " · " + garYazi(m.garantiAy) + " garanti" : "") + (m.bakimAy ? " · " + m.bakimAy + " ayda bakım" : "") : m.stokTut ? "Stok " + m.stok : "Stok tutulmaz"}${az ? ` · <span class="et e-uy">azaldı</span>` : ""}${m.sik ? " · ★" : ""}</small></div><div class="fiyat">${fiyatAralik(m)}${!hizmetMi(m) && m.alis && yon() ? `<small>alış ${tl(m.alis)}</small>` : ""}</div></button>`; }).join("") : ""; }).join("")}</div>`;
}
function malzemeEkran(id) {
  const yeni = id === "yeni" || id === "yeniurun", urunY = id === "yeniurun";
  const m = yeni ? {ad: "", tur: urunY ? "urun" : "hizmet", grup: urunY ? "Ürün" : MF.g !== "Hepsi" && MF.g !== "Ürün" ? MF.g : "Yıkama", f: ["", "", "", ""], satis: "", alis: "", stok: 0, sinir: 0, stokTut: urunY, sik: false, garantiAy: 0, bakimAy: 0} : A().malzeme.find(x => x.id === id);
  if (!m || (yeni && !yon())) return `${ust("Kayıt bulunamadı", "", true)}<main class="ic"></main>`;
  const H = hizmetMi(m), S = siniflar();
  if (!yon()) return `${ust(H ? "Hizmet" : "Ürün", esc(m.ad), true)}<main class="ic" data-baglan="malzemeP">
    <div class="kart ayar" style="padding:2px 14px"><div class="s"><div>Grubu</div><b>${esc(m.grup)}</b></div>${H ? S.map((s, k) => `<div class="s"><div>${esc(s)}</div><b>${tl(fiyatOf(m, k + 1))}</b></div>`).join("") : `<div class="s"><div>Satış fiyatı</div><b>${tl(m.satis)}</b></div><div class="s"><div>Stok</div><b>${m.stokTut ? m.stok + " adet" : "tutulmaz"}</b></div>`}
      ${m.garantiAy ? `<div class="s"><div>Garanti</div><b>${garYazi(m.garantiAy)}</b></div>` : ""}</div>
    ${!H ? `<button class="btn koyu" id="mGiris">＋ Stok girişi</button>` : ""}<p class="kucuk">Fiyat ve liste değişikliğini yönetici yapar.</p></main>`;
  return `${ust(yeni ? (H ? "Yeni hizmet" : "Yeni ürün") : H ? "Hizmet" : "Ürün", esc(m.ad), true)}<main class="ic" data-baglan="malzeme">
    <label>Adı<input class="girdi" id="mAd" value="${esc(m.ad)}" placeholder="${H ? "ör. İç dış yıkama" : "ör. Oto şampuanı 1 L"}"></label>
    <div class="cips" id="mTur"><button class="cip ${H ? "on" : ""}" data-t="hizmet">Hizmet (araca yapılan)</button><button class="cip ${H ? "" : "on"}" data-t="urun">Ürün satışı (stoklu)</button></div>
    <label>Grubu</label><div class="cips" style="margin-top:-6px" id="mGrup">${gruplar().map(g => `<button class="cip ${m.grup === g ? "on" : ""}" data-g="${esc(g)}">${esc(g)}</button>`).join("")}<button class="cip" data-gyeni style="color:var(--ana)">＋ Yeni grup</button><button class="cip" data-a="kategori" style="color:var(--soluk)">✎ Grupları düzenle</button></div>
    <div id="mHiz" style="display:${H ? "grid" : "none"};gap:12px"><div class="kucuk" style="font-weight:700">Araç sınıfına göre fiyat (₺)</div>
      <div class="ikili-g">${S.map((s, k) => `<label>${esc(s)}<input class="girdi" id="mF${k + 1}" inputmode="decimal" value="${esc((m.f || [])[k] ?? "")}"></label>`).join("")}</div>
      <label>Ürün payı / maliyet (₺)<input class="girdi" id="mMal" inputmode="decimal" value="${esc(m.alis)}" placeholder="kullanılan film, seramik vb."></label>
      <p class="kucuk" style="margin-top:-6px">Kârı hesaplamak için kullanılır. Ürünü müşteri getirirse fiyattan bu kadar düşülür.</p>
      <div class="ikili-g"><label>Garanti (ay · yoksa 0)<input class="girdi" id="mGar" inputmode="numeric" value="${esc(m.garantiAy || 0)}"></label><label>Bakım hatırlatma (ay)<input class="girdi" id="mBak" inputmode="numeric" value="${esc(m.bakimAy || 0)}"></label></div>
      <p class="kucuk" style="margin-top:-6px">Garanti varsa teslimde garanti belgesi çıkar. Bakım ayı yazılırsa o kadar ay sonra müşteri ana sayfada hatırlatılır.</p></div>
    <div id="mUrun" style="display:${H ? "none" : "grid"};gap:12px"><div class="ikili-g"><label>Satış fiyatı (₺)<input class="girdi" id="mSatis" inputmode="decimal" value="${esc(m.satis)}"></label><label>Alış fiyatı (₺)<input class="girdi" id="mAlis" inputmode="decimal" value="${esc(m.alis)}"></label></div>
      <div class="kart ayar" style="padding:2px 14px"><div class="s"><div>Stok tut</div><button class="anah ${m.stokTut ? "on" : ""}" id="mStokTut" aria-label="Stok tut"></button></div></div>
      <div class="ikili-g" id="mStokAlan" ${m.stokTut ? "" : "hidden"}><label>Stok<input class="girdi" id="mStok" inputmode="numeric" value="${esc(m.stok)}"></label><label>Bu sayının altında uyar<input class="girdi" id="mSinir" inputmode="numeric" value="${esc(m.sinir)}"></label></div></div>
    <div class="kart ayar" style="padding:2px 14px"><div class="s"><div>Sık kullanılanlarda göster<small>Araç alırken en üstte</small></div><button class="anah ${m.sik ? "on" : ""}" id="mSik" aria-label="Sık kullanılan"></button></div></div>
    <div class="ikili-g">${yeni || H ? "" : `<button class="btn ince" id="mGiris">＋ Stok girişi</button>`}<button class="btn koyu" id="mKaydet" style="${yeni || H ? "grid-column:span 2" : ""}">Kaydet</button></div>
    ${yeni ? "" : `<button class="btn ince" id="mSil" style="color:var(--tehlike)">Sil</button>`}</main>`;
}
// 8 · kasa
const KF = {d: "ay", a: "", b: ""};
function kasaAraligi() {
  const t = bugun();
  if (KF.d === "gun") return [t, t];
  if (KF.d === "hafta") { const d = new Date(t + "T12:00:00"), g = (d.getDay() + 6) % 7; return [gunEkle(t, -g), t]; }
  if (KF.d === "ay") return [t.slice(0, 8) + "01", t];
  return [KF.a || t, KF.b || t];
}
function kasaEkran() {
  const [a, b] = kasaAraligi(), bitis = b + "T99", is = A().islem.filter(i => i.ts >= a && i.ts <= bitis && i.durum !== "randevu");
  const od = is.filter(i => i.odendi), top = od.reduce((s, i) => s + i.toplam, 0);
  const tur = {}; od.filter(i => i.toplam).forEach(i => { tur[i.odeme || "Diğer"] = (tur[i.odeme || "Diğer"] || 0) + i.toplam; });
  const alin = is.filter(i => !i.odendi).reduce((s, i) => s + i.toplam, 0), gider = is.reduce((s, i) => s + (i.kalemler || []).reduce((x, k) => x + k.adet * (k.alis || 0), 0), 0);
  const hasta = new Set(is.filter(i => i.hastaId).map(i => i.hastaId)).size, t = bugun();
  const gunler = [...Array(7)].map((_, k) => gunEkle(t, k - 6)), gt = gunler.map(g => A().islem.filter(i => i.odendi && i.ts.startsWith(g)).reduce((s, i) => s + i.toplam, 0)), mx = Math.max(1, ...gt);
  const say = {}; is.forEach(i => (i.kalemler || []).forEach(k => { if (!say[k.ad]) say[k.ad] = {n: 0, t: 0}; say[k.ad].n += k.adet; say[k.ad].t += k.adet * k.fiyat; }));
  const enCok = Object.entries(say).sort((x, y) => y[1].t - x[1].t).slice(0, 5);
  const baslik = KF.d === "gun" ? "Bugün" : KF.d === "hafta" ? "Bu hafta" : KF.d === "ay" ? AY_TAM[+t.slice(5, 7) - 1] + " " + t.slice(0, 4) : tr(a) + " – " + tr(b);
  return `${ust("Kasa", baslik)}${seritler()}<main class="ic" data-baglan="kasa">
    <div class="cips">${[["gun", "Bugün"], ["hafta", "Bu hafta"], ["ay", "Bu ay"], ["ozel", "Tarih seç"]].map(([k, x]) => `<button class="cip ${KF.d === k ? "on" : ""}" data-kd="${k}">${x}</button>`).join("")}</div>
    ${KF.d === "ozel" ? `<div class="ikili-g"><label>Başlangıç<input class="girdi" type="date" id="kA" value="${a}"></label><label>Bitiş<input class="girdi" type="date" id="kB" value="${b}"></label></div>` : ""}
    <div class="kahraman"><small>${esc(baslik)} toplamı</small><b>${tl(top)}</b><div class="ikili" style="flex-wrap:wrap;gap:6px 16px">${Object.entries(tur).map(([k, v]) => `<span>${esc(k)} <b>${tl(v).replace(" ₺", "")}</b></span>`).join("") || "<span>Henüz tahsilat yok</span>"}</div></div>
    ${bolumKart(is)}${veresiyeKart()}${teslimKart()}${yon() ? primKart(is) : ""}
    <div class="kart"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--soluk)"><span>Son 7 gün</span><span>Bugün ${tl(gt[6])}</span></div>
      <div class="cubuk">${gt.map((v, k) => `<span class="${k === 6 ? "bug" : ""}" style="height:${Math.max(4, Math.round(v / mx * 100))}%" title="${tl(v)}"></span>`).join("")}</div>
      <div class="cubuk-alt">${gunler.map((g, k) => `<span>${k === 6 ? "Bugün" : GUN_KISA[new Date(g + "T12:00:00").getDay()]}</span>`).join("")}</div></div>
    <div class="uc"><div class="kart"><small>Araç</small><b>${hasta}</b></div><div class="kart"><small>Alınacak</small><b style="color:${alin ? "var(--uyari)" : "inherit"}">${tl(alin)}</b></div>${yon() ? `<div class="kart"><small>Ürün gideri</small><b>${tl(gider)}</b></div>` : `<div class="kart"><small>İşlem</small><b>${is.length}</b></div>`}</div>
    ${yon() ? `<div class="uc"><div class="kart"><small>Kâr</small><b style="color:${top - gider >= 0 ? "var(--iyi)" : "var(--tehlike)"}">${tl(top - gider)}</b></div><div class="kart"><small>Kâr oranı</small><b>${top ? "%" + Math.round((top - gider) / top * 100) : "–"}</b></div><div class="kart"><small>İşlem başı</small><b>${is.length ? tl(Math.round((top + alin) / is.length)) : "–"}</b></div></div>
    <p class="kucuk" style="margin:-4px 4px 0">Kâr = tahsil edilen − kullanılan ürünlerin maliyeti (film, seramik, satılan ürün; kira, maaş, su, elektrik dahil değil).</p>` : ""}
    ${yon() && is.some(i => i.perAd) ? `<div class="bas">Personel</div><div class="kart liste">${perOzet(is).map(([k, v]) => `<div class="s" style="cursor:default"><span class="av ${renk(k)}">${esc(bas(k))}</span><div class="m"><b>${esc(k)}</b><small>${v.n} işlem${v.alin ? " · " + tl(v.alin) + " alınacak" : ""}</small></div><div class="t">${tl(v.t)}</div></div>`).join("")}</div>` : ""}
    <div class="bas">En çok yapılan</div>
    ${enCok.length ? `<div class="kart liste">${enCok.map(([k, v]) => `<div class="s" style="cursor:default"><div class="m"><b>${esc(k)}</b><small>${v.n} adet</small></div><div class="t">${tl(v.t)}</div></div>`).join("")}</div>` : `<div class="kart bos-durum">Bu dönemde işlem yok.</div>`}
    ${yon() ? `<button class="btn ince" data-a="excel">⬇ Excel'e aktar (${is.length} işlem)</button>
    <button class="btn ince" data-a="kasaWa">💬 Özeti WhatsApp'tan gönder${Veri.ayar("isletmeTel") ? ` · ${esc(Veri.ayar("isletmeTel"))}` : ""}</button>` : ""}
  </main>${altCubuk("kasa")}`;
}
function perOzet(is) { const o = {}; for (const i of is) { const k = i.perAd || "Belirtilmemiş"; if (!o[k]) o[k] = {n: 0, t: 0, alin: 0}; o[k].n++; if (i.odendi) o[k].t += i.toplam; else o[k].alin += i.toplam; } return Object.entries(o).sort((a, b) => b[1].t - a[1].t); }
function kasaOzeti() {
  const [a, b] = kasaAraligi(), bitis = b + "T99", is = A().islem.filter(i => i.ts >= a && i.ts <= bitis && i.durum !== "randevu"), t = bugun();
  const od = is.filter(i => i.odendi), top = od.reduce((s, i) => s + i.toplam, 0), alin = is.filter(i => !i.odendi).reduce((s, i) => s + i.toplam, 0);
  const gider = is.reduce((s, i) => s + (i.kalemler || []).reduce((x, k) => x + k.adet * (k.alis || 0), 0), 0), kar = top - gider;
  const tur = {}; od.filter(i => i.toplam).forEach(i => { tur[i.odeme || "Diğer"] = (tur[i.odeme || "Diğer"] || 0) + i.toplam; });
  const say = {}; is.forEach(i => (i.kalemler || []).forEach(k => { if (!say[k.ad]) say[k.ad] = {n: 0, t: 0}; say[k.ad].n += k.adet; say[k.ad].t += k.adet * k.fiyat; }));
  const enCok = Object.entries(say).sort((x, y) => y[1].t - x[1].t).slice(0, 3);
  const donem = KF.d === "gun" ? "Bugün (" + tr(t) + ")" : KF.d === "hafta" ? "Bu hafta (" + tr(a) + " – " + tr(b) + ")" : KF.d === "ay" ? AY_TAM[+t.slice(5, 7) - 1] + " " + t.slice(0, 4) : tr(a) + " – " + tr(b);
  const d = new Date(), c = "━━━━━━━━━━━━━━";
  return [`📊 *${Veri.ayar("isletmeAd") || "Esnaf Oto Detay Mobil"}*`, `*${donem} kasa özeti*`, c,
    `💰 Tahsilat: *${tl(top)}*`, ...Object.entries(tur).map(([k, v]) => `    • ${k}: ${tl(v)}`),
    `⏳ Alınacak: ${tl(alin)}`, `📦 Ürün / malzeme gideri: ${tl(gider)}`, `✅ Kâr: *${tl(kar)}*${top ? ` (%${Math.round(kar / top * 100)})` : ""}`,
    `🚗 Araç: ${new Set(is.filter(i => i.hastaId).map(i => i.hastaId)).size} · İş: ${is.length}`,
    ...(enCok.length ? ["", "🏆 En çok yapılan:", ...enCok.map(([k, v], i) => `    ${i + 1}. ${k} · ${v.n} adet · ${tl(v.t)}`)] : []),
    ...(is.some(i => i.perAd) ? ["", "👤 Personel:", ...perOzet(is).map(([k, v]) => `    • ${k}: ${v.n} işlem · ${tl(v.t)}`)] : []),
    c, `_Esnaf Oto Detay Mobil · ${tr(yerel(d))} ${saat(yerel(d))}_`].join("\n");
}
async function excelAktar() {
  const [a, b] = kasaAraligi(), bitis = b + "T99";
  const is = A().islem.filter(i => i.ts >= a && i.ts <= bitis).sort((x, y) => x.ts.localeCompare(y.ts));
  const q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const satir = [["Tarih", "Saat", "Plaka", "Müşteri", "Telefon", "Yapılanlar", "Bölüm", "Tutar", "Ödeme", "Durum", "Yıkayan", "Kaydeden", "Garanti no", "Not"].map(q).join(";")];
  for (const i of is.filter(i => i.durum !== "randevu")) { const h = hastaBul(i.hastaId) || {}; satir.push([tr(i.ts), saat(i.ts), h.plaka ? plakaYaz(h.plaka) : "", h.ad, h.tel, kalemYazi(i), {yikama: "Yıkama", detay: "Detay", urun: "Ürün satışı"}[i.bolum] || "", String(i.toplam).replace(".", ","), i.odendi ? (i.toplam ? i.odeme : "Ücretsiz") : "Ödenmedi", DURUM[i.durum] || "", i.yikayan || "", i.perAd || "", i.garanti ? i.garanti.no : "", i.not].map(q).join(";")); }
  await dosyaVer(`OtoDefteri-${a}-${b}.csv`, "﻿" + satir.join("\r\n"), "text/csv");
}

// 9 · ayarlar
function ayarlarEkranP() {          // personel: yalnız kendi işleri
  const d = OTURUM.durum || {}, sy = Veri.ayar("sonYedek");
  return `${ust("Ayarlar", esc(OTURUM.kim.ad))}${seritler()}<main class="ic" style="gap:10px">
    <div class="grup">Oturum</div><div class="kart ayar" style="padding:2px 14px">
      <button class="s" data-a="kilitle" style="width:100%;text-align:left"><div>${esc(OTURUM.kim.ad)} · kişi değiştir<small>Telefonu başkası kullanacaksa dokunun · şifre ekranına döner</small></div><span class="ok">⇄</span></button>
      <button class="s" data-a="pin" style="width:100%;text-align:left"><div>Şifremi değiştir<small>4–8 rakam</small></div><span class="ok">›</span></button></div>
    <div class="grup">Ekip · birden fazla telefon</div><div class="kart ayar" style="padding:2px 14px">
      <button class="s" data-a="ekipPaylas" style="width:100%;text-align:left"><div>Defteri paylaş<small>Vardiya sonunda ekip arkadaşınıza WhatsApp'tan gönderin</small></div><span class="ok">›</span></button>
      <button class="s" data-a="ekipBirlestir" style="width:100%;text-align:left"><div>Gelen defteri birleştir<small>Yeni kayıtlar eklenir, aynı kayıtlar bir kez kalır</small></div><span class="ok">›</span></button></div>
    <div class="grup">Yedek</div><div class="kart ayar" style="padding:2px 14px">
      <button class="s" data-a="yedek" style="width:100%;text-align:left"><div>Yedeği gönder<small>${sy ? "Son yedek " + tr(yerel(new Date(sy))) + " " + saat(yerel(new Date(sy))) : "Henüz yedek alınmadı"} · yönetici şifresiyle kilitli</small></div><span class="ok">›</span></button></div>
    <div class="grup">Program</div><div class="kart ayar" style="padding:2px 14px">
      <div class="s"><div>Lisans<small>Cihaz kodu <b style="font-family:monospace">${esc(Veri.ayar("cihaz") || "")}</b></small></div><span class="et ${d.acik ? (d.tur === "deneme" ? "e-uy" : "e-iyi") : "e-teh"}">${esc(d.yaz || "…")}</span></div>
      <div class="s"><div>Sürüm ${SURUM}<small>Fiyat, liste, kasa kârı ve diğer ayarlar yöneticidedir</small></div></div></div>
  </main>${altCubuk("ayarlar")}`;
}
function stokGirisi(m) {
  if (!izinVar("stok girişi")) return;
  perde(`<h3>Stok girişi · ${esc(m.ad)}</h3><label>Gelen adet<input class="girdi" id="gA" inputmode="numeric"></label>${yon() ? `<label>Yeni alış fiyatı (isteğe bağlı)<input class="girdi" id="gF" inputmode="decimal" placeholder="${esc(m.alis || "")}"></label>` : ""}<button class="btn koyu" id="gK">Ekle</button>`, s => {
    s.querySelector("#gA").focus();
    s.querySelector("#gK").onclick = async () => { const n = Math.round(sayi(s.querySelector("#gA").value)); if (!n) return toast("Adet yazın"); const f = s.querySelector("#gF"), fv = f ? f.value.trim() : "";
      if (fv) m.alis = sayi(fv); if (fv || !m.stokTut) { m.stokTut = true; await Veri.kaydet("malzeme", m); }
      await stokHareket(m.id, n, "giris", "", personelVar() ? kimSu().ad : ""); kapat(); toast(`${n} adet eklendi · stok ${m.stok}`); ciz(); }; });
}

// ---------------------------------------------------------------- paket (peşin yıkama paketi), bakım hatırlatma, bölüm ve prim
// Paket araç kaydında (h.kurler: {id, ad, toplam, pesin, fiyat, basla, kapandi}); kullanım işte (kurId, kurSira) — ekip birleştirmesi bunları taşır.
const kurSeans = (hId, kId) => A().islem.filter(i => i.hastaId === hId && i.kurId === kId && i.durum !== "randevu").sort((a, b) => a.ts.localeCompare(b.ts));
function kurDurum(h, k) {
  const s = kurSeans(h.id, k.id), n = s.length, son = s[n - 1];
  return {n, son, bitti: !!k.kapandi || n >= k.toplam};
}
function kurDoldur(h, k) {          // paketten yıkama: son kullanımın hizmetleri tek dokunuşla
  const s = kurSeans(h.id, k.id), son = s[s.length - 1];
  YENI.adet = {}; YENI.hastadan = {};
  for (const x of (son && son.kalemler) || []) if (A().malzeme.some(m => m.id === x.malId)) YENI.adet[x.malId] = x.adet;
  YENI.kurId = k.id; YENI.paketSat = -1; YENI.bedava = false; YENI.tutarElle = null;
}
// bakım zamanı gelen (ya da 3 gün içinde gelecek) araçlar
function gelecekler() {
  const t = bugun(), out = [], ileri = gunEkle(t, 3), sinir = gunEkle(t, -45);
  for (const i of A().islem) {
    if (!i.kontrol || i.kontrolKapandi || i.kontrol > ileri || i.kontrol < sinir) continue;
    const h = hastaBul(i.hastaId); if (!h) continue;
    if (A().islem.some(x => x.hastaId === h.id && x.id !== i.id && x.durum !== "randevu" && x.ts.slice(0, 10) >= gunEkle(i.kontrol, -30))) continue;          // bakıma geldi ya da randevusu var
    out.push({h, i, gun: gunFark(i.kontrol, t)});
  }
  return out.sort((a, b) => b.gun - a.gun);
}
const bakimMetni = x => `Merhaba${x.h.ad ? " " + x.h.ad : ""}, ${plakaYaz(x.h.plaka)} plakalı aracınızın ${x.i.kontrolNot || "bakım"} zamanı ${x.gun >= 0 ? "geldi" : "yaklaşıyor"} (${tr(x.i.kontrol)}). Size uygun bir gün randevu verelim mi?${isletmeImza()}`;
function gelecekKart() {
  const L = gelecekler(); if (!L.length) return "";
  return `<div class="bas">🔔 Bakım zamanı gelenler · ${L.length}</div><div class="kart liste">${L.slice(0, 15).map(x => { const wa = waNo(x.h.tel), et = x.gun > 0 ? [x.gun + " gün geçti", "e-teh"] : x.gun === 0 ? ["bugün", "e-uy"] : [-x.gun + " gün sonra", "e-ana"];
    return `<div class="s" data-git="hasta/${x.h.id}">${plakaHtml(x.h.plaka, 1)}<div class="m"><b>${esc(x.h.ad || plakaYaz(x.h.plaka))}</b><small style="white-space:normal"><span class="et ${et[1]}">${et[0]}</span> ${esc(x.i.kontrolNot || "Bakım")}</small></div>${wa ? `<a class="t" href="https://wa.me/${wa}?text=${encodeURIComponent(bakimMetni(x))}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:21px;text-decoration:none" aria-label="WhatsApp hatırlatma">💬</a>` : `<span class="t kucuk">telefon yok</span>`}</div>`; }).join("")}</div>`;
}
function kontrolSerit(h) {
  const L = A().islem.filter(i => i.hastaId === h.id && i.kontrol && !i.kontrolKapandi && i.kontrol >= gunEkle(bugun(), -45) && !A().islem.some(x => x.hastaId === h.id && x.id !== i.id && x.durum !== "randevu" && x.ts.slice(0, 10) >= gunEkle(i.kontrol, -30)));
  return L.map(i => `<div class="serit ${i.kontrol <= bugun() ? "uy" : "ana"}" style="margin:0">🔔 ${esc(i.kontrolNot || "Bakım")}: ${esc(gunYazi(i.kontrol))}${i.kontrol < bugun() ? " (" + gunFark(i.kontrol, bugun()) + " gün geçti)" : ""}<button data-kontkapat="${i.id}">Kapat</button></div>`).join("");
}
function kisiCiftleri() {          // iki telefonda aynı plaka ayrı açılmışsa
  const c = Ekip.ciftler(); if (!c.length) return;
  const [a, b] = c[0];
  const oz = h => { const is = A().islem.filter(i => i.hastaId === h.id); return `${h.ad ? esc(h.ad) + " · " : ""}${h.tel ? esc(h.tel) : "telefon yok"} · ${is.length} iş`; };
  perde(`<h3>Bu iki kayıt aynı araç mı?</h3><p class="kucuk">İki telefonda ayrı ayrı yeni araç olarak açılmış olabilir.${c.length > 1 ? ` (${c.length} benzer kayıt var)` : ""}</p>
    <div class="kart liste">${[a, b].map(h => `<div class="s" style="cursor:default">${plakaHtml(h.plaka, 1)}<div class="m"><b>${esc(plakaYaz(h.plaka))}</b><small>${oz(h)}</small></div></div>`).join("")}</div>
    <button class="btn ana" id="kB">Aynı araç · birleştir</button><button class="btn ince" id="kF">Farklı araçlar</button><button class="btn ince" data-kapat>Sonra</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    s.querySelector("#kB").onclick = async () => { const [x, y] = (a.ilk || "") <= (b.ilk || "") ? [a, b] : [b, a]; await Ekip.kisiBirlestir(x, y); kapat(); toast(`${plakaYaz(x.plaka)} · kayıtlar birleştirildi`); ciz(); kisiCiftleri(); };
    s.querySelector("#kF").onclick = async () => { await Ekip.farkli(a, b); kapat(); kisiCiftleri(); };
  });
}
// 1.2.0 veresiye: borcu olan araçlar (tarih aralığından bağımsız, en eski borç önce)
function veresiyeKart() {
  const L = A().hasta.map(h => { const is = hastaIslem(h.id).filter(i => !i.odendi && i.durum !== "randevu"); return {h, b: is.reduce((s, i) => s + i.toplam, 0), eski: is.map(i => i.ts).sort()[0]}; }).filter(x => x.b > 0).sort((a, b) => a.eski.localeCompare(b.eski));
  if (!L.length) return "";
  const top = L.reduce((s, x) => s + x.b, 0);
  return `<div class="bas">📒 Veresiye · ${L.length} araç · toplam ${tl(top)}</div><div class="kart liste">${L.slice(0, 30).map(x => { const wa = waNo(x.h.tel), gun = gunFark(x.eski, bugun());
    const m = `Merhaba${x.h.ad ? " " + x.h.ad : ""}, ${plakaYaz(x.h.plaka)} plakalı aracınız için ${tl(x.b)} ödemeniz bekliyor. Uygun olduğunuzda ödeyebilirsiniz, teşekkür ederiz.${isletmeImza()}`;
    return `<div class="s" data-git="hasta/${x.h.id}">${aracResim(x.h.id)}${plakaHtml(x.h.plaka, 1)}<div class="m"><b>${tl(x.b)}${x.h.ad ? " · " + esc(x.h.ad) : ""}</b><small>${gun ? gun + " gündür bekliyor" : "bugün"} · dokunup tahsil edin</small></div>${wa ? `<a class="t" href="https://wa.me/${wa}?text=${encodeURIComponent(m)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:21px;text-decoration:none" aria-label="Ödeme hatırlatma">💬</a>` : ""}</div>`; }).join("")}</div>`;
}
function bolumKart(is) {
  const B = {yikama: "🫧 Yıkama", detay: "✨ Detay · kaplama", urun: "🛒 Ürün satışı"}, o = {};
  for (const i of is.filter(i => i.odendi && i.toplam)) { const k = i.bolum || "yikama"; o[k] = (o[k] || 0) + i.toplam; }
  const e = Object.entries(B).filter(([k]) => o[k]);
  return e.length > 1 ? `<div class="uc">${e.map(([k, t]) => `<div class="kart"><small>${t}</small><b>${tl(o[k])}</b></div>`).join("")}</div>` : "";
}
function primKart(is) {
  const P = Object.assign({yikama: 0, detay: 0}, Veri.ayar("prim") || {}), o = {};
  for (const i of is.filter(i => i.durum === "teslim" && i.yikayan)) { const k = o[i.yikayan] || (o[i.yikayan] = {n: 0, d: 0}); if (i.bolum === "detay") k.d += i.toplam; else if (i.bolum === "yikama") k.n++; }
  const L = Object.entries(o); if (!L.length) return "";
  const var_ = +P.yikama || +P.detay;
  return `<div class="bas">Yıkayan / usta · prim<button data-a="prim" style="color:var(--ana);font-weight:600">Prim ayarı ›</button></div><div class="kart liste">${L.map(([ad, v]) => { const p = v.n * (+P.yikama || 0) + v.d * (+P.detay || 0) / 100;
    return `<div class="s" style="cursor:default"><span class="av ${renk(ad)}">${esc(bas(ad))}</span><div class="m"><b>${esc(ad)}</b><small>${v.n} yıkama${v.d ? " · detay " + tl(v.d) : ""}</small></div><div class="t">${var_ ? tl(p) : "—"}<small>prim</small></div></div>`; }).join("")}</div>
    <p class="kucuk" style="margin:-4px 4px 0">${var_ ? `Prim = teslim edilen yıkama × ${tl(P.yikama)} + detay cirosu × %${P.detay}.` : 'Prim ayarı yapılmamış: "Prim ayarı"ndan yıkama başı tutar ve detay yüzdesi girin.'}</p>`;
}

// ---------------------------------------------------------------- ayarlar
function ayarlarEkran() {
  if (!yon()) return ayarlarEkranP();
  const d = OTURUM.durum || {}, sy = Veri.ayar("sonYedek"), P = Object.assign({yikama: 0, detay: 0}, Veri.ayar("prim") || {}), N = +Veri.ayar("sadakatAdet") || 0, G = Veri.ayar("google");
  const sat = (a, t, alt, sag) => `<button class="s" data-a="${a}" style="width:100%;text-align:left"><div>${t}${alt ? `<small>${alt}</small>` : ""}</div>${sag || `<span class="ok">›</span>`}</button>`;
  const grup = (t, ic) => `<div class="grup">${t}</div><div class="kart ayar" style="padding:2px 14px">${ic}</div>`;
  return `${ust("Ayarlar")}${seritler()}<main class="ic" style="gap:10px">
    ${grup("İşletme", sat("isletme", esc(Veri.ayar("isletmeAd") || "İşletme adı"), esc(Veri.ayar("isletmeTel") || "") + (Veri.ayar("isletmeAdres") ? " · " + esc(Veri.ayar("isletmeAdres")) : "")))}
    ${grup("Hizmet ve fiyat", `<button class="s" data-git="malzeme" style="width:100%;text-align:left"><div>Hizmet ve ürün listesi<small>${A().malzeme.length} kayıt · fiyat, garanti, bakım, stok</small></div><span class="ok">›</span></button>`
      + sat("siniflar", "Araç sınıfları", siniflar().map(esc).join(" · ")) + sat("kategori", "Gruplar", gruplar().map(esc).join(" · ")) + sat("odeme", "Ödeme türleri", odemeTurleri().map(esc).join(" · ")))}
    ${grup("Paket ve sadakat", sat("paketler", "Yıkama paketleri", paketler().map(p => esc(p.ad) + " · " + tl(p.fiyat)).join(" / ") || "Paket yok") + sat("sadakat", "Sadakat · bedava yıkama", N ? `Her ${N}. yıkama bedava` : "Kapalı"))}
    ${grup("Çalışanlar ve prim", sat("calisanlar", "Yıkayan / usta adları", (Veri.ayar("calisanlar") || []).map(esc).join(" · ") || "Araç alırken kimin yıkadığı seçilir") + sat("prim", "Prim", +P.yikama || +P.detay ? `Yıkama başı ${tl(P.yikama)} · detay %${P.detay}` : "Ayarlanmadı")
      + sat("personel", "Personel girişi ve şifreleri", personelVar() ? personeller().map(p => esc(p.ad)).join(" · ") : "Ortak telefonda herkes kendi şifresiyle girer · maliyet ve kârı yalnız siz görürsünüz") + (personelVar() ? sat("kilitle", "Kişi değiştir", "Şifre ekranına döner", `<span class="ok">⇄</span>`) : ""))}
    ${grup("Müşteriye giden yazılar", sat("hazirMesaj", '"Aracınız hazır" mesajı', esc((Veri.ayar("hazirMesaj") || "Merhaba{ad}, {plaka} plakalı aracınız hazır.").slice(0, 80))) + sat("garantiSart", "Garanti belgesi koşulları", "Belgenin altında yazan metin") + sat("googleYorum", "Google yorum bağlantısı", Veri.ayar("googleYorum") ? esc(Veri.ayar("googleYorum").slice(0, 60)) : "Teslimden sonra \"Google'da yorum iste\" düğmesi için"))}
    ${grup("Ekip · birden fazla telefon", sat("ekipPaylas", "Defteri paylaş", "Gün sonunda diğer telefona WhatsApp'tan gönderin") + sat("ekipBirlestir", "Gelen defteri birleştir", "Yeni kayıtlar eklenir, aynı kayıtlar bir kez kalır") + sat("ekipSifre", "Ekip şifresi", Veri.ayar("ekipSifre") ? "Belirlendi · ekipteki herkeste aynı olmalı" : "Paylaşım dosyasını korur · herkes aynısını yazar"))}
    ${grup("Güvenlik ve yedek", sat("pin", personelVar() ? "Yönetici şifresi" : "Giriş şifresi", `4–8 rakam · ${Veri.ayar("kilitDk") || 2} dk arka planda kalınca kilitlenir`)
      + sat("google", googleBagli() ? "Google · " + esc(G.e) : "Google ile bağla", googleBagli() ? (Veri.ayar("sonDrive") ? "Son Drive yedeği " + esc(gunSaat(yerel(new Date(Veri.ayar("sonDrive"))))) : "Drive'a henüz yedek gitmedi") : "Drive'a otomatik yedek · telefon değişse de kaybolmaz · isteğe bağlı", `<span class="et ${googleBagli() ? "e-iyi" : "e-ana"}">${googleBagli() ? "Bağlı" : "Bağla"}</span>`)
      + sat("yedek", "Yedeği gönder", `${sy ? "Son yedek " + esc(gunSaat(yerel(new Date(sy)))) : "Henüz yedek alınmadı"} · fotoğraflar hariç`) + sat("geriyukle", "Yedekten geri yükle", "Yeni telefonda ya da silinip kurulunca"))}
    ${grup("Program", sat("kopyala", "Lisans", `Cihaz kodu <b style="font-family:monospace">${esc(Veri.ayar("cihaz") || "")}</b> · dokunup kopyalayın`, `<span class="et ${d.acik ? (d.tur === "deneme" ? "e-uy" : "e-iyi") : "e-teh"}">${esc(d.yaz || "…")}</span>`)
      + sat("lisansYenile", "Lisansı şimdi denetle", "İnternet gerekir", `<span class="ok">↻</span>`) + sat("saticiya", "Satıcıyla iletişim", "Lisans, destek · WhatsApp")
      + `<div class="s"><div>Sürüm ${SURUM}<small>Veriler yalnız bu cihazda · müşteri bilgisi hiçbir yere gönderilmez</small></div></div>`)}
  </main>${altCubuk("ayarlar")}`;
}
const EYLEM_OTO = {
  siniflar() {
    perde(`<h3>Araç sınıfları</h3><p class="kucuk">Hizmet fiyatları bu dört sınıfa göre girilir; burada yalnız adları değişir.</p>${siniflar().map((s, k) => `<label>${k + 1}. sınıf<input class="girdi" data-sn="${k}" value="${esc(s)}"></label>`).join("")}<button class="btn koyu" id="sK">Kaydet</button>`, s => {
      s.querySelector("#sK").onclick = async () => { const L = [...s.querySelectorAll("[data-sn]")].map(i => i.value.trim()); if (L.some(x => !x)) return toast("Dört sınıfın adını da yazın"); await Veri.ayarYaz("siniflar", L); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  paketler() {
    const satir = (p, k) => `<div class="pk-s" data-k="${k}"><input class="girdi" data-f="ad" value="${esc(p.ad)}" placeholder="Paket adı"><input class="girdi" data-f="adet" inputmode="numeric" value="${esc(p.adet)}" placeholder="Adet"><input class="girdi" data-f="fiyat" inputmode="decimal" value="${esc(p.fiyat)}" placeholder="Fiyat ₺"><button data-sil style="color:var(--tehlike);font-size:20px" aria-label="Sil">×</button></div>`;
    perde(`<h3>Yıkama paketleri</h3><p class="kucuk">Müşteri paketi peşin alır; her gelişte "Paketten düş" ile o yıkama ücretsiz yazılır, kalan sayı araç kartında görünür. Satılmış paketler değişmez.</p>
      <div class="pk-bas"><span>Adı</span><span>Yıkama</span><span>Fiyat</span><span></span></div><div id="pkL">${paketler().map(satir).join("")}</div><button class="btn ince" id="pkE">＋ Paket ekle</button><button class="btn koyu" id="pkK">Kaydet</button>`, s => {
      s.querySelector("#pkE").onclick = () => s.querySelector("#pkL").insertAdjacentHTML("beforeend", satir({ad: "", adet: 10, fiyat: ""}, Date.now()));
      s.querySelector("#pkL").addEventListener("click", e => { if (e.target.closest("[data-sil]")) e.target.closest(".pk-s").remove(); });
      s.querySelector("#pkK").onclick = async () => { const L = [...s.querySelectorAll(".pk-s")].map(r => ({ad: r.querySelector('[data-f="ad"]').value.trim(), adet: Math.round(sayi(r.querySelector('[data-f="adet"]').value)), fiyat: sayi(r.querySelector('[data-f="fiyat"]').value)})).filter(p => p.ad);
        if (L.some(p => p.adet < 2 || p.adet > 100 || !p.fiyat)) return toast("Her pakete adet (2–100) ve fiyat yazın"); await Veri.ayarYaz("paketler", L); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  sadakat() {
    perde(`<h3>Sadakat · bedava yıkama</h3><p class="kucuk">Örneğin 10 yazarsanız her araç 9 ücretli yıkamadan sonra 10.'yu bedava yaptırabilir. Araç alırken program hatırlatır, bedava yapıp yapmamak size kalır. 0 = kapalı.</p>
      <label>Kaçıncı yıkama bedava<input class="girdi" id="sdN" inputmode="numeric" value="${esc(Veri.ayar("sadakatAdet") || 0)}"></label><button class="btn koyu" id="sdK">Kaydet</button>`, s => {
      s.querySelector("#sdK").onclick = async () => { const n = Math.round(sayi(s.querySelector("#sdN").value)); if (n && (n < 3 || n > 50)) return toast("3 ile 50 arasında yazın (0 = kapalı)"); await Veri.ayarYaz("sadakatAdet", n); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  prim() {
    const P = Object.assign({yikama: 0, detay: 0}, Veri.ayar("prim") || {});
    perde(`<h3>Prim</h3><p class="kucuk">Kasa ekranında her yıkayan / usta için o dönemin primi hesaplanır: teslim edilen yıkama sayısı × yıkama başı tutar + detay işlerinin cirosu × yüzde. Ödeme size kalır; program yalnız hesaplar.</p>
      <div class="ikili-g"><label>Yıkama başı (₺)<input class="girdi" id="prY" inputmode="decimal" value="${esc(P.yikama)}"></label><label>Detay cirosundan (%)<input class="girdi" id="prD" inputmode="decimal" value="${esc(P.detay)}"></label></div><button class="btn koyu" id="prK">Kaydet</button>`, s => {
      s.querySelector("#prK").onclick = async () => { const d = sayi(s.querySelector("#prD").value); if (d > 100) return toast("Yüzde 100'den büyük olamaz"); await Veri.ayarYaz("prim", {yikama: sayi(s.querySelector("#prY").value), detay: d}); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  hazirMesaj() {
    const v = Veri.ayar("hazirMesaj") || "Merhaba{ad}, {plaka} plakalı aracınız hazır. {tutar}Teşekkür ederiz.";
    perde(`<h3>"Aracınız hazır" mesajı</h3><p class="kucuk">Araç "Hazır"a geçince 💬 ile gönderilir. {ad} müşteri adı, {plaka} plaka, {tutar} ödenmemişse "Ödenecek tutar: …" olur. Sonuna işletme adı ve telefonu eklenir.</p>
      <textarea class="girdi" id="hmT" rows="4">${esc(v)}</textarea><button class="btn ince" id="hmV">Varsayılana dön</button><button class="btn koyu" id="hmK">Kaydet</button>`, s => {
      s.querySelector("#hmV").onclick = () => { s.querySelector("#hmT").value = "Merhaba{ad}, {plaka} plakalı aracınız hazır. {tutar}Teşekkür ederiz."; };
      s.querySelector("#hmK").onclick = async () => { const t = s.querySelector("#hmT").value.trim(); if (t.length < 5) return toast("Mesajı yazın"); await Veri.ayarYaz("hazirMesaj", t); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  garantiSart() {
    perde(`<h3>Garanti belgesi koşulları</h3><p class="kucuk">Garanti belgesinin altında bu metin yazar. Boş bırakırsanız hazır metin kullanılır.</p><textarea class="girdi" id="gsT" rows="7">${esc(Veri.ayar("garantiSart") || "")}</textarea><button class="btn koyu" id="gsK">Kaydet</button>`, s => {
      s.querySelector("#gsK").onclick = async () => { await Veri.ayarYaz("garantiSart", s.querySelector("#gsT").value.trim()); kapat(); toast("Kaydedildi"); }; });
  },
  googleYorum() {
    perde(`<h3>Google yorum bağlantısı</h3><p class="kucuk">Google İşletme Profilinizde "Yorum isteyin" / "Paylaş" bölümündeki bağlantıyı buraya yapıştırın. Araç teslim edilince "⭐ Google'da yorum iste" düğmesi müşteriye bu bağlantıyı WhatsApp'tan gönderir.</p>
      <input class="girdi" id="gyT" value="${esc(Veri.ayar("googleYorum") || "")}" placeholder="https://g.page/r/..." autocomplete="off"><button class="btn koyu" id="gyK">Kaydet</button>`, s => {
      s.querySelector("#gyK").onclick = async () => { const v = s.querySelector("#gyT").value.trim(); if (v && !/^https:\/\/\S+$/.test(v)) return toast("Bağlantı https:// ile başlamalı"); await Veri.ayarYaz("googleYorum", v); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  calisanlar() {
    perde(`<h3>Yıkayan / usta adları</h3><p class="kucuk">Her satıra bir ad. Araç alırken ve işte "kim yıkadı" olarak seçilir, kasada prim hesabında kullanılır. Personel girişi açtıysanız onların adları kendiliğinden listede.</p>
      <textarea class="girdi" id="clT" rows="6" placeholder="Ali&#10;Mehmet">${esc((Veri.ayar("calisanlar") || []).join("\n"))}</textarea><button class="btn koyu" id="clK">Kaydet</button>`, s => {
      s.querySelector("#clK").onclick = async () => { const L = [...new Set(s.querySelector("#clT").value.split("\n").map(x => x.trim()).filter(Boolean))].slice(0, 30); await Veri.ayarYaz("calisanlar", L); kapat(); toast("Kaydedildi"); ciz(); }; });
  }
};
// ---------------------------------------------------------------- 1.3.0 kasa teslimi (vardiya / gün sonu)
// Beklenen nakit = başta kasada olan para + son teslimden bu yana (personel varsa o kişinin aldığı) nakit ödemeler. Teslimler bu cihazda saklanır.
const nakitMi = o => kucuk(o || "").includes("nakit");
const teslimler = () => Veri.ayar("teslimler") || [];
const kasaAlan = i => i.odemePer || i.per || "y";
const farkYazi = f => !f ? "tam ✓" : f < 0 ? tl(-f) + " eksik" : tl(f) + " fazla";
const farkRenk = f => !f ? "var(--iyi)" : f < 0 ? "var(--tehlike)" : "var(--uyari)";
function teslimHesap(kimId) {
  const simdi = yerel(new Date()).slice(0, 19);
  const son = teslimler().filter(x => !personelVar() || x.per === kimId).sort((a, b) => b.ts.localeCompare(a.ts))[0];
  const bas = son ? son.ts : bugun() + "T00:00:00";
  const L = A().islem.filter(i => i.odendi && i.toplam && (i.odemeTs || i.ts) > bas && (i.odemeTs || i.ts) <= simdi && (!personelVar() || kasaAlan(i) === kimId));
  const tur = {}; L.forEach(i => { const k = i.odeme || "Diğer"; tur[k] = (tur[k] || 0) + i.toplam; });
  const N = L.filter(i => nakitMi(i.odeme));
  return {son, bas, L, tur, nakit: N.reduce((s, i) => s + i.toplam, 0), nakitN: N.length};
}
function teslimKart() {
  const kim = kimSu(), H = teslimHesap(kim.id), L = teslimler().slice().sort((a, b) => b.ts.localeCompare(a.ts));
  return `<div class="kart" style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>🧾 Kasa teslimi</b><span class="kucuk">${H.son ? "son teslim " + esc(gunSaat(H.son.ts)) + ` · <b style="color:${farkRenk(H.son.fark)}">${farkYazi(H.son.fark)}</b>` : "henüz teslim yok"}</span></div>
    <div class="kucuk">Vardiya ya da gün bitince kasadaki nakit parayı sayıp yazın. Program, olması gereken tutarla karşılaştırır ve eksik ya da fazla varsa gösterir. ${H.son ? "Son teslimden" : "Bugün sabahtan"} bu yana ${personelVar() ? "sizin aldığınız " : ""}nakit: <b>${tl(H.nakit)}</b></div>
    <button class="btn ince" data-a="kasaTeslim" style="padding:10px">Kasayı say ve teslim et</button></div>
    ${yon() && L.length ? `<div class="bas">Kasa teslimleri</div><div class="kart liste">${L.slice(0, 10).map(r => `<div class="s" style="cursor:default"><span class="av ${renk(r.perAd)}">${esc(bas(r.perAd))}</span><div class="m"><b>${personelVar() ? esc(r.perAd) + " · " : ""}${esc(gunSaat(r.ts))}</b><small style="white-space:normal">Olması gereken ${tl(r.beklenen)} · sayılan ${tl(r.sayilan)}${r.not ? " · " + esc(r.not) : ""}</small></div><div class="t" style="color:${farkRenk(r.fark)}">${farkYazi(r.fark)}</div></div>`).join("")}</div>` : ""}`;
}
function kasaTeslim() {
  if (!izinVar("kasa teslimi")) return;
  const kim = kimSu(), H = teslimHesap(kim.id), basP = +(Veri.ayar("kasaBas") || 0);
  const diger = Object.entries(H.tur).filter(([k]) => !nakitMi(k));
  perde(`<h3>Kasa teslimi${personelVar() ? " · " + esc(kim.ad) : ""}</h3>
    <p class="kucuk">Kasadaki nakit parayı sayın ve aşağıya yazın. Program ${H.son ? "son teslimden (" + esc(gunSaat(H.son.ts)) + ")" : "bugün sabahtan"} bu yana ${personelVar() ? "sizin aldığınız" : "alınan"} nakit ödemeleri toplar ve saydığınız parayla karşılaştırır.</p>
    <div class="kart ayar" style="padding:2px 14px"><div class="s"><div>Nakit alınan ödemeler<small>${H.nakitN} ödeme</small></div><b>${tl(H.nakit)}</b></div>
      ${diger.map(([k, v]) => `<div class="s"><div>${esc(k)}<small>bankaya geçer, kasaya girmez · yalnız bilgi</small></div><b>${tl(v)}</b></div>`).join("")}</div>
    <label>Başta kasada olan para (bozukluk)<input class="girdi" id="tBas" inputmode="decimal" value="${basP || ""}" placeholder="0"></label>
    <p class="kucuk" style="margin-top:-6px">Vardiya başında kasada bırakılan para üstü. Yoksa boş bırakın; program bir sonraki teslimde hatırlar.</p>
    <div class="kart" style="display:flex;justify-content:space-between;align-items:center"><span>Kasada olması gereken<small class="kucuk" style="display:block">başta olan + nakit ödemeler</small></span><b id="tBek" style="font-size:18px"></b></div>
    <label>Kasada saydığınız nakit<input class="girdi" id="tSay" inputmode="decimal" placeholder="Saydığınız tutar" style="font-size:20px"></label>
    <div id="tFark" class="kart" style="text-align:center;font-weight:700"></div>
    <label>Not (isteğe bağlı)<input class="girdi" id="tNot" placeholder="Örn. 100 ₺ bozukluğa verildi"></label>
    <button class="btn koyu" id="tK">Teslim et</button><button class="btn ince" data-kapat>Vazgeç</button>`, s => {
    const bek = () => sayi(s.querySelector("#tBas").value) + H.nakit;
    const yaz = () => { s.querySelector("#tBek").textContent = tl(bek()); const v = s.querySelector("#tSay").value.trim(), f = s.querySelector("#tFark");
      if (!v) { f.textContent = "Saydığınız tutarı yazınca fark burada görünür"; f.style.color = "var(--soluk)"; return; }
      const d = Math.round((sayi(v) - bek()) * 100) / 100; f.textContent = !d ? "✓ Kasa tam" : d < 0 ? "Eksik: " + tl(-d) : "Fazla: " + tl(d); f.style.color = farkRenk(d); };
    yaz(); s.querySelector("#tBas").oninput = yaz; s.querySelector("#tSay").oninput = yaz; s.querySelector("#tSay").focus();
    s.querySelector("[data-kapat]").onclick = kapat;
    s.querySelector("#tK").onclick = async () => {
      const v = s.querySelector("#tSay").value.trim(); if (!v) return toast("Kasada saydığınız parayı yazın");
      const b0 = sayi(s.querySelector("#tBas").value), say = sayi(v), fark = Math.round((say - b0 - H.nakit) * 100) / 100;
      const r = {id: Veri.yeniId(), ts: yerel(new Date()).slice(0, 19), bas: H.bas, per: kim.id, perAd: kim.ad, acilis: b0, nakit: H.nakit, beklenen: b0 + H.nakit, sayilan: say, fark, tur: H.tur, n: H.L.length, not: s.querySelector("#tNot").value.trim()};
      await Veri.ayarYaz("teslimler", [...teslimler(), r].slice(-500)); await Veri.ayarYaz("kasaBas", b0);
      teslimSonuc(r); };
  });
}
function teslimMetni(r) {
  return [`🧾 *Kasa teslimi* · ${Veri.ayar("isletmeAd") || ""}`, `${personelVar() ? r.perAd + " · " : ""}${tr(r.ts)} ${saat(r.ts)}`, "━━━━━━━━━━━━━━",
    `Başta kasada: ${tl(r.acilis)}`, `Nakit ödemeler: ${tl(r.nakit)}`, `Olması gereken: *${tl(r.beklenen)}*`, `Sayılan: *${tl(r.sayilan)}*`, `Sonuç: *${!r.fark ? "Kasa tam ✓" : r.fark < 0 ? tl(-r.fark) + " eksik" : tl(r.fark) + " fazla"}*`,
    ...Object.entries(r.tur || {}).filter(([k]) => !nakitMi(k)).map(([k, v]) => `${k}: ${tl(v)} (bilgi)`), ...(r.not ? ["Not: " + r.not] : [])].join("\n");
}
function teslimSonuc(r) {
  const no = waNo(Veri.ayar("isletmeTel"));
  perde(`<h3 style="color:${farkRenk(r.fark)}">${!r.fark ? "✓ Kasa tam" : r.fark < 0 ? "Kasa " + tl(-r.fark) + " eksik" : "Kasa " + tl(r.fark) + " fazla"}</h3>
    <div class="kart ayar" style="padding:2px 14px"><div class="s"><div>Olması gereken</div><b>${tl(r.beklenen)}</b></div><div class="s"><div>Sayılan</div><b>${tl(r.sayilan)}</b></div></div>
    <p class="kucuk">Teslim kaydedildi. Sonraki teslim bu andan itibaren hesaplanır.${yon() ? "" : " Yönetici, Kasa ekranında bu teslimi görür."}</p>
    ${no ? `<a class="btn ince" href="https://wa.me/${no}?text=${encodeURIComponent(teslimMetni(r))}" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">💬 İşletme numarasına WhatsApp'tan gönder</a>` : ""}<button class="btn koyu" data-kapat>Tamam</button>`, s => {
    s.querySelector("[data-kapat]").onclick = () => { kapat(); ciz(); }; });
}

// ---------------------------------------------------------------- 1.3.0 depoya sipariş listesi
function siparisAdaylari() {
  const t = bugun(), out = [];
  for (const m of A().malzeme) {
    const az = m.stokTut && m.sinir > 0 && m.stok <= m.sinir, skt = !!(m.skt && m.skt.length >= 7 && m.skt.slice(0, 7) <= gunEkle(t, 60).slice(0, 7));
    if (az || skt) out.push({m, az, skt, n: az ? Math.max(m.sinir * 2 - m.stok, 1) : Math.max(+m.sinir || 1, 1)});
  }
  return out.sort((a, b) => a.m.ad.localeCompare(b.m.ad, "tr"));
}
function siparisListesi() {
  const L = siparisAdaylari();
  perde(`<h3>📋 Tedarikçiye sipariş listesi</h3><p class="kucuk">Stoğu uyarı sınırına inen ve son kullanma tarihi 2 ay içinde dolan malzemeler burada toplanır. Adetleri değiştirebilir, istemediğinizin işaretini kaldırabilirsiniz. "WhatsApp'tan gönder" deyince depoya hazır sipariş mesajı açılır.</p>
    ${L.length ? `<div class="kart" style="padding:4px 14px">${L.map((x, k) => `<div class="mal"><label style="display:flex;gap:10px;align-items:center;flex:1;margin:0;font-weight:600"><input type="checkbox" data-sk="${k}" checked style="width:20px;height:20px;flex-shrink:0"><span class="ad">${esc(x.m.ad)}<small>${x.m.stokTut ? "stok " + x.m.stok + (x.m.sinir ? " · uyarı sınırı " + x.m.sinir : "") : ""}${x.skt ? ` · <span class="et e-teh">SKT ${x.m.skt.slice(5, 7)}.${x.m.skt.slice(0, 4)}</span>` : ""}</small></span></label><input class="girdi" data-sn="${k}" inputmode="numeric" value="${x.n}" aria-label="Adet" style="width:72px;padding:8px;text-align:center"></div>`).join("")}</div>`
      : `<div class="kart bos-durum"><b>Azalan ürün yok</b>"Hizmet · ürün" ekranında her ürüne "Bu sayının altında uyar" sınırı yazın; stok o sayıya inince burada listelenir.</div>`}
    <label>Tedarikçi WhatsApp numarası<input class="girdi" id="sTel" type="tel" inputmode="tel" value="${esc(Veri.ayar("depoTel") || "")}" placeholder="Boş bırakılırsa kişiyi WhatsApp'ta seçersiniz"></label>
    ${L.length ? `<button class="btn ana" id="sW">💬 WhatsApp'tan gönder</button><button class="btn ince" id="sK">Listeyi kopyala</button>` : ""}<button class="btn ince" data-kapat>Kapat</button>`, s => {
    s.querySelector("[data-kapat]").onclick = kapat;
    const metin = () => { const sec = L.map((x, k) => ({x, on: s.querySelector(`[data-sk="${k}"]`).checked, n: Math.round(sayi(s.querySelector(`[data-sn="${k}"]`).value))})).filter(y => y.on && y.n > 0);
      return sec.length ? [`📋 *Sipariş listesi*`, `${Veri.ayar("isletmeAd") || ""} · ${tr(bugun())}`, "━━━━━━━━━━━━━━", ...sec.map(y => `• ${y.x.m.ad} × ${y.n}`), "━━━━━━━━━━━━━━", `${Veri.ayar("isletmeAd") || ""}${Veri.ayar("isletmeTel") ? " · " + Veri.ayar("isletmeTel") : ""}`].join("\n") : ""; };
    const sw = s.querySelector("#sW"); if (sw) sw.onclick = async () => { const m = metin(); if (!m) return toast("En az bir ürün seçin"); const tel = s.querySelector("#sTel").value.trim(); await Veri.ayarYaz("depoTel", tel); const no = waNo(tel); window.open(`https://wa.me/${no}?text=${encodeURIComponent(m)}`, "_blank"); };
    const sk = s.querySelector("#sK"); if (sk) sk.onclick = async () => { const m = metin(); if (!m) return toast("En az bir ürün seçin"); try { await navigator.clipboard.writeText(m); toast("Liste kopyalandı"); } catch (e) { toast("Kopyalanamadı"); } };
  });
}

// ---------------------------------------------------------------- 1.1.0 araç resmi, Drive fotoğraf yedeği, belge resmi, sizi özledik, pano süreleri, lisans ekranı
// araç resimleri (foto deposunda tur "arac", isId = araç kimliği) açılışta belleğe alınır: panoda ve listede hemen görünür
const AFOTO = new Map();
async function aracFotoYukle() { AFOTO.forEach(u => URL.revokeObjectURL(u)); AFOTO.clear(); for (const f of await Veri.fotolar()) if (f.tur === "arac") AFOTO.set(f.isId, URL.createObjectURL(f.blob)); }
const aracResim = (hId, sinif) => AFOTO.has(hId) ? `<img class="${sinif || "thumb"}" src="${AFOTO.get(hId)}" alt="">` : "";
function aracFotoSec(hId) {
  if (!izinVar("fotoğraf")) return;
  fotoSec(async blob => { for (const f of (await Veri.fotolar()).filter(f => f.tur === "arac" && f.isId === hId)) await Veri.fotoSil(f.id);
    await fotoKaydet(hId, "arac", blob); await aracFotoYukle(); toast("Araç resmi kaydedildi"); ciz(); driveYedekle(true); });
}
// Drive: yeni fotoğraflar her yedeklemede (en çok 20'si) ayrı dosya olarak gider; geri yüklemede inmeyenler indirilir
async function fotoDriveEsitle() {
  const gitti = new Set(Veri.ayar("fotoDrive") || []), L = (await Veri.fotolar()).filter(f => !gitti.has(f.id)).slice(0, 20);
  for (const f of L) { await Google.fotoYukle(f); gitti.add(f.id); }
  if (L.length) await Veri.ayarYaz("fotoDrive", [...gitti].slice(-20000));
  return L.length;
}
async function fotoDriveGetir() {
  const yerel = new Set((await Veri.fotolar()).map(f => f.id)), L = (await Google.fotoListe()).filter(f => !yerel.has(f.id)); let n = 0;
  for (const f of L) { try { await Veri.fotoYaz({id: f.id, isId: f.isId, tur: f.tur, ts: f.ts, blob: await Google.fotoIndir(f.driveId)}); n++; } catch (e) { /* sıradaki */ } }
  await Veri.ayarYaz("fotoDrive", [...new Set([...(Veri.ayar("fotoDrive") || []), ...L.map(f => f.id)])]);
  await aracFotoYukle(); return n;
}
async function fotoYetimTemizle() {          // geri yüklemeden sonra artık olmayan işlerin / araçların fotoğrafları
  const var_ = new Set([...A().islem.map(i => i.id), ...A().hasta.map(h => h.id)]);
  for (const f of await Veri.fotolar()) if (!var_.has(f.isId)) await Veri.fotoSil(f.id);
  await aracFotoYukle();
}
// garanti belgesi ve fiş resim olarak (WhatsApp'ta doğrudan açılır, yazıcı gerekmez)
function belgeResmi(tur, i) {
  const W = 1080, P = 64, c = document.createElement("canvas"); c.width = W; c.height = 4200;
  const x = c.getContext("2d"), h = hastaBul(i.hastaId) || {}, F = "system-ui,-apple-system,Segoe UI,Roboto,sans-serif";
  x.fillStyle = "#fff"; x.fillRect(0, 0, W, c.height); x.fillStyle = "#111"; x.textBaseline = "top";
  let y = P;
  const yaz = (t, boy, kalin, renk, hiza) => { x.font = `${kalin ? 700 : 400} ${boy}px ${F}`; x.fillStyle = renk || "#111"; const satirlar = []; let s = "";
    for (const k of String(t).split(" ")) { const d = s ? s + " " + k : k; if (x.measureText(d).width > W - 2 * P && s) { satirlar.push(s); s = k; } else s = d; } if (s) satirlar.push(s);
    for (const l of satirlar) { x.textAlign = hiza || "left"; x.fillText(l, hiza === "center" ? W / 2 : hiza === "right" ? W - P : P, y); y += boy * 1.35; } x.textAlign = "left"; };
  const cizgi = (k) => { x.fillStyle = "#111"; x.fillRect(P, y, W - 2 * P, k || 2); y += 18; };
  const satir = (a, b, kalin) => { x.font = `${kalin ? 700 : 400} 30px ${F}`; x.fillStyle = "#111"; const bw = x.measureText(b).width; let a2 = a; while (x.measureText(a2).width > W - 2 * P - bw - 30 && a2.length > 4) a2 = a2.slice(0, -2); if (a2 !== a) a2 += "…";
    x.fillText(a2, P, y); x.textAlign = "right"; x.fillText(b, W - P, y); x.textAlign = "left"; y += 44; };
  yaz(Veri.ayar("isletmeAd") || "", 44, true); yaz([Veri.ayar("isletmeTel"), Veri.ayar("isletmeAdres")].filter(Boolean).join(" · "), 26, false, "#444"); y += 6; cizgi(3);
  if (tur === "garanti") {
    const g = i.garanti; yaz("GARANTİ BELGESİ", 40, true, "#111", "center"); y += 8;
    satir("Belge no", g.no, true); satir("Tarih", tr(g.bas)); satir("Plaka", plakaYaz(h.plaka || ""), true); if (h.ad) satir("Müşteri", h.ad); if (h.marka || h.renk) satir("Araç", [h.marka, h.renk].filter(Boolean).join(" · "));
    y += 8; cizgi(); yaz("UYGULAMA · SÜRE · BİTİŞ", 26, true, "#555");
    for (const k of g.kalemler) { satir(k.ad, garYazi(k.ay) + " · " + tr(k.bitis), true); if (k.hastadan) yaz("Ürün müşteriye aittir; ürün garantisi verilmez, yalnız işçilik garantisi geçerlidir.", 24, false, "#555"); }
    const mk = Object.entries(i.mikron || {}); if (mk.length) { y += 8; cizgi(); yaz("BOYA KALINLIĞI (µm) · ÖNCE / SONRA", 26, true, "#555"); for (const [p, v] of mk) satir(p, `${v[0] || "—"} / ${v[1] || "—"}`); }
    if (i.kontrol) { y += 8; yaz(`Bakım: ${i.kontrolNot || ""} · ${tr(i.kontrol)}`, 28, true); }
    y += 10; cizgi(1); yaz(Veri.ayar("garantiSart") || GARANTI_SART, 22, false, "#444");
  } else {
    yaz("BİLGİ FİŞİ", 36, true, "#111", "center"); y += 4;
    satir(tr(i.teslimTs || i.ts) + " " + saat(i.teslimTs || i.ts), h.plaka ? plakaYaz(h.plaka) : "", true); if (h.ad) satir("Müşteri", h.ad); y += 4; cizgi(1);
    for (const k of i.kalemler || []) satir(k.ad + (k.adet > 1 ? " ×" + k.adet : ""), tl(k.adet * k.fiyat));
    cizgi(2); satir("TOPLAM", tl(i.toplam), true); yaz(i.odendi ? (i.toplam ? "Ödeme: " + (i.odeme || "") : "Ücretsiz" + (i.kurId ? " (paket)" : "")) : "Ödenmedi", 28);
    y += 10; yaz("Bu belge bilgi fişidir, mali değeri yoktur.", 22, false, "#555");
  }
  y += P; const son = document.createElement("canvas"); son.width = W; son.height = y; son.getContext("2d").drawImage(c, 0, 0);
  return new Promise(ok => son.toBlob(ok, "image/png"));
}
async function belgePaylas(tur, i, kaydet) {
  const h = hastaBul(i.hastaId), ad = `${tur === "garanti" ? i.garanti.no : "fis-" + (h ? plakaNorm(h.plaka) : "satis")}-${(i.teslimTs || i.ts).slice(0, 10)}.png`, blob = await belgeResmi(tur, i);
  const dosya = new File([blob], ad, {type: "image/png"});
  try { if (!kaydet && navigator.canShare && navigator.canShare({files: [dosya]})) { await navigator.share({files: [dosya], title: ad}); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  toast(kaydet ? "Resim telefona kaydedildi (İndirilenler)" : "Resim indirildi · WhatsApp'tan ekleyebilirsiniz");
}
const yorumMetni = i => { const h = hastaBul(i.hastaId); return `Merhaba${h && h.ad ? " " + h.ad : ""}, bizi tercih ettiğiniz için teşekkür ederiz. Memnun kaldıysanız Google'da birkaç kelimeyle değerlendirir misiniz?\n${Veri.ayar("googleYorum")}${isletmeImza()}`; };
// sizi özledik: 30 günden uzun gelmeyen araçlar (WhatsApp gönderilince 14 gün listeden çıkar)
function ozlenenler() {
  const t = bugun(), g = Veri.ayar("ozledik") || {}, out = [];
  for (const h of A().hasta) {
    const is = hastaIslem(h.id); if (is.some(i => i.durum === "randevu" || ["sira", "islemde", "hazir"].includes(i.durum))) continue;
    const son = is.find(i => i.durum === "teslim"); if (!son) continue;
    const gun = gunFark((son.teslimTs || son.ts).slice(0, 10), t); if (gun < 30 || gun > 365) continue;
    if (g[h.id] && gunFark(g[h.id], t) < 14) continue;
    const kalan = (h.kurler || []).filter(k => !kurDurum(h, k).bitti).reduce((s, k) => s + k.toplam - kurDurum(h, k).n, 0);
    out.push({h, gun, n: is.filter(i => i.durum === "teslim").length, kalan});
  }
  return out.sort((a, b) => b.n - a.n || a.gun - b.gun);
}
const ozledikMetni = x => `Merhaba${x.h.ad ? " " + x.h.ad : ""}, sizi özledik! ${plakaYaz(x.h.plaka)} plakalı aracınızı bekliyoruz.${x.kalan ? ` Paketinizde ${x.kalan} yıkama hakkınız duruyor.` : ""}${isletmeImza()}`;
const ozledikSatir = x => { const wa = waNo(x.h.tel); return `<div class="s" data-git="hasta/${x.h.id}">${aracResim(x.h.id)}${plakaHtml(x.h.plaka, 1)}<div class="m"><b>${esc(x.h.ad || "—")}</b><small>${x.gun} gün önce · ${x.n} geliş${x.kalan ? " · paketinde " + x.kalan + " yıkama" : ""}</small></div>${wa ? `<a class="t" data-ozl="${x.h.id}" href="https://wa.me/${wa}?text=${encodeURIComponent(ozledikMetni(x))}" target="_blank" rel="noopener" style="font-size:21px;text-decoration:none" aria-label="WhatsApp">💬</a>` : `<span class="t kucuk">telefon yok</span>`}</div>`; };
// pano süreleri
const dkFark = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 6e4));
const bekleme = i => i.durum === "sira" ? dkFark(i.ts, yerel(new Date()).slice(0, 19)) : i.durum === "islemde" ? dkFark(i.islemdeTs || i.ts, yerel(new Date()).slice(0, 19)) : 0;
function gunOzet() {
  const t = bugun(), L = A().islem.filter(i => i.ts.startsWith(t) && i.islemdeTs && i.hazirTs), B = A().islem.filter(i => i.ts.startsWith(t) && i.islemdeTs);
  const ort = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : null;
  const yik = ort(L.map(i => dkFark(i.islemdeTs, i.hazirTs))), bek = ort(B.map(i => dkFark(i.ts, i.islemdeTs)));
  const saatler = {}; for (const i of A().islem.filter(i => i.ts >= gunEkle(t, -30) && i.durum !== "randevu" && i.bolum !== "urun")) { const s = +i.ts.slice(11, 13); saatler[s] = (saatler[s] || 0) + 1; }
  let enS = null, enN = 0; for (let s = 6; s < 23; s++) { const n = (saatler[s] || 0) + (saatler[s + 1] || 0); if (n > enN) { enN = n; enS = s; } }
  return {yik, bek, yogun: enN >= 3 ? `${String(enS).padStart(2, "0")}–${String(enS + 2).padStart(2, "0")}` : null};
}
// lisans yok: program açılmaz (deneme hariç); kayıtlar silinmez, lisans gelince kaldığı yerden devam eder
function lisansEkrani(u) {
  const d = OTURUM.durum || {};
  u.innerHTML = `<main class="kilit" style="gap:14px;padding:24px"><div class="logo">🔒</div><div><b style="font-size:21px">${esc(d.yaz || "Lisans gerekli")}</b>
    <div class="kucuk" style="margin-top:6px;max-width:340px">Esnaf Oto Detay Mobil lisans olmadan kullanılamaz. Kayıtlarınız silinmedi; lisans açılınca her şey kaldığı yerden devam eder.</div></div>
    <div class="kart" style="max-width:340px;width:100%;text-align:left"><small class="kucuk">Cihaz kodu · satıcıya gönderin</small><div style="font:800 22px ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;margin-top:4px">${esc(Veri.ayar("cihaz") || "")}</div></div>
    <button class="btn ana" data-a="saticiya" style="max-width:340px">💬 Satıcıya WhatsApp'tan yaz</button>
    <button class="btn koyu" data-a="lisansYenile" style="max-width:340px">↻ Lisansı şimdi denetle</button>
    <button class="btn ince" data-a="kopyala" style="max-width:340px">Cihaz kodunu kopyala</button>
    <button class="btn ince" data-a="yedek" style="max-width:340px">💾 Kayıtlarımın yedeğini al</button></main>`;
}

// ---------------------------------------------------------------- ekran olayları
const simdiTs = () => yerel(new Date()).slice(0, 19);
const BAGLA = {
  kurulum(u) {
    u.querySelector("#kGo").onclick = async () => {
      const ad = u.querySelector("#kAd").value.trim(), tel = u.querySelector("#kTel").value.trim(), p1 = u.querySelector("#kPin").value, p2 = u.querySelector("#kPin2").value, h = u.querySelector("#kHata");
      if (ad.length < 2) return h.textContent = "İşletme adını yazın";
      if (tel.replace(/\D/g, "").length < 10) return h.textContent = "İşletme telefonunu yazın (en az 10 rakam)";
      if (!/^\d{4,8}$/.test(p1)) return h.textContent = "Şifre 4–8 rakam olmalı";
      if (p1 !== p2) return h.textContent = "Şifreler aynı değil";
      await Veri.ayarYaz("isletmeAd", ad); await Veri.ayarYaz("isletmeTel", tel); await pinKaydet(p1);
      if (!A().malzeme.length) {
        for (const [ad2, grup, f, mal, gar, bak, sik] of ORNEK_HIZMET) await Veri.kaydet("malzeme", {ad: ad2, tur: "hizmet", grup, f, satis: f[1], alis: mal, garantiAy: gar, bakimAy: bak, sik: !!sik, stokTut: false, stok: 0, sinir: 0});
        for (const [ad2, satis, alis, stok, sinir] of ORNEK_URUN) { const m = await Veri.kaydet("malzeme", {ad: ad2, tur: "urun", grup: "Ürün", satis, alis, stok, sinir, stokTut: true, sik: false, garantiAy: 0, bakimAy: 0});
          await Veri.kaydet("hareket", {id: "ac:" + m.id, malId: m.id, n: stok, tur: "acilis", ts: simdiTs()}); }
        await Veri.ayarYaz("paketler", ORNEK_PAKET);
      }
      stokYenile();
      await Veri.ayarYaz("kurulum", new Date().toISOString());
      OTURUM.acik = true; OTURUM.pin = p1; await lisansTazele(true); git("malzeme"); toast("Hazır · örnek fiyatları kendi fiyatlarınızla değiştirin");
    };
  },
  yeni(u) {
    const ic = u.querySelector("#yeniIc");
    const tazele = odak => { const a = document.activeElement, id = a && a.id, pos = a && a.selectionStart; ic.innerHTML = yeniIc(); const e = id && ic.querySelector("#" + id); if (e && odak !== false) { e.focus(); try { e.setSelectionRange(pos, pos); } catch (x) { /* tarih kutusu */ } } };
    ic.addEventListener("input", e => {
      const t = e.target, id = t.id, v = t.value;
      if (id === "yPlaka") { YENI.plaka = v; YENI.yeniArac = false; const alt = ic.querySelector("#yAlt"), g = document.createElement("div"); g.innerHTML = yeniIc(); const y = g.querySelector("#yAlt"); if (alt && y) alt.innerHTML = y.innerHTML; else tazele(); }
      else if (id === "yAd") YENI.ad = v; else if (id === "yTel") YENI.tel = v; else if (id === "yNot") YENI.not = v; else if (id === "yHasar") YENI.hasar = v; else if (id === "yRandevu") YENI.randevuTs = v;
      else if (t.dataset.mk) { const m = YENI.mikron[t.dataset.mk] || ["", ""]; m[+t.dataset.mi] = v; YENI.mikron[t.dataset.mk] = m; }
    });
    ic.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.hsec) { const h = hastaBul(b.dataset.hsec); YENI.hastaId = h.id; YENI.sinif = +h.sinif || 2; YENI.yeniArac = false; tazele(false); return; }
      if (b.hasAttribute("data-hyeni")) { YENI.yeniArac = true; tazele(false); const x = ic.querySelector("#yAd"); if (x) x.focus(); return; }
      if (b.hasAttribute("data-hdegis")) { YENI.yeniArac = false; tazele(false); const x = ic.querySelector("#yPlaka"); if (x) x.focus(); return; }
      if (b.hasAttribute("data-hdeg2")) { Object.assign(YENI, {hastaId: "", plaka: "", kurId: "", bedava: false, paketSat: -1, tutarElle: null}); ic.innerHTML = yeniIc(); const x = ic.querySelector("#yPlaka"); if (x) x.focus(); return; }
      if (b.dataset.sinif) { YENI.sinif = +b.dataset.sinif; YENI.tutarElle = null; tazele(false); return; }
      if (b.dataset.grup) { YENI.grup = b.dataset.grup; tazele(false); return; }
      if (b.dataset.arti) { YENI.adet[b.dataset.arti] = (YENI.adet[b.dataset.arti] || 0) + 1; YENI.tutarElle = null; tazele(false); return; }
      if (b.dataset.eksi) { const k = b.dataset.eksi; YENI.adet[k] = Math.max(0, (YENI.adet[k] || 0) - 1); if (!YENI.adet[k]) delete YENI.hastadan[k]; YENI.tutarElle = null; tazele(false); return; }
      if (b.dataset.hastadan) { const k = b.dataset.hastadan; if (YENI.hastadan[k]) delete YENI.hastadan[k]; else { YENI.hastadan[k] = true; toast("Ürünü müşteri getirdi: fiyattan ürün payı düşüldü, garanti yalnız işçilik"); } YENI.tutarElle = null; tazele(false); return; }
      if (b.dataset.kursec) { const h = hastaBul(YENI.hastaId), k = h && (h.kurler || []).find(x => x.id === b.dataset.kursec); if (k) { if (Object.values(YENI.adet).some(x => x > 0)) { YENI.kurId = k.id; YENI.paketSat = -1; YENI.bedava = false; YENI.tutarElle = null; } else kurDoldur(h, k); } tazele(false); return; }
      if (b.hasAttribute("data-kurcik")) { YENI.kurId = ""; YENI.tutarElle = null; tazele(false); return; }
      if (b.hasAttribute("data-bedava")) { YENI.bedava = !YENI.bedava; YENI.tutarElle = null; tazele(false); return; }
      if (b.hasAttribute("data-paketsat")) { YENI.paketSat = YENI.paketSat >= 0 ? -1 : 0; YENI.kurId = ""; YENI.bedava = false; YENI.tutarElle = null; tazele(false); return; }
      if (b.dataset.pk) { YENI.paketSat = +b.dataset.pk; tazele(false); return; }
      if (b.dataset.yik !== undefined) { YENI.yikayan = b.dataset.yik; tazele(false); return; }
      if (b.hasAttribute("data-mikac")) { YENI.mikronAcik = true; tazele(false); return; }
      if (b.hasAttribute("data-fotoekle")) { fotoSec(blob => { YENI.fotolar.push(blob); tazele(false); }); return; }
      if (b.dataset.fotosil) { YENI.fotolar.splice(+b.dataset.fotosil, 1); tazele(false); return; }
      if (b.hasAttribute("data-randevuac")) { YENI.randevu = !YENI.randevu; if (YENI.randevu) { YENI.odeme = "Teslimde"; if (!YENI.randevuTs) YENI.randevuTs = gunEkle(bugun(), 1) + "T10:00"; } tazele(false); return; }
      if (b.dataset.odeme) { YENI.odeme = b.dataset.odeme; tazele(false); return; }
      if (b.hasAttribute("data-tutar")) {
        perde(`<h3>Toplam tutar</h3><input class="girdi" id="tT" inputmode="decimal" style="font-size:24px;text-align:center"><div class="ikili-g"><button class="btn ince" id="tO">Otomatik hesapla</button><button class="btn koyu" id="tK">Tamam</button></div>`, s => {
          const i = s.querySelector("#tT"); i.value = YENI.tutarElle != null ? YENI.tutarElle : ""; i.focus();
          s.querySelector("#tO").onclick = () => { YENI.tutarElle = null; kapat(); tazele(false); };
          s.querySelector("#tK").onclick = () => { YENI.tutarElle = i.value.trim() === "" ? null : sayi(i.value); kapat(); tazele(false); }; });
        return;
      }
      if (b.hasAttribute("data-kaydet")) yeniKaydet();
    });
    const p = ic.querySelector("#yPlaka"); if (p && !YENI.plaka) p.focus();
  },
  satis(u) {
    const ara = u.querySelector("#sAra"); if (ara) ara.addEventListener("input", e => { SATIS.q = e.target.value; u.querySelector("#sOneri").innerHTML = satisOneri(); });
    u.querySelector(".ic").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.sarti) { const m = A().malzeme.find(x => x.id === b.dataset.sarti), n = (SATIS.adet[m.id] || 0) + 1; if (m.stokTut && n > m.stok) toast(`Stokta ${m.stok} adet görünüyor`); SATIS.adet[m.id] = n; ciz(); }
      else if (b.dataset.seksi) { SATIS.adet[b.dataset.seksi] = Math.max(0, (SATIS.adet[b.dataset.seksi] || 0) - 1); ciz(); }
      else if (b.dataset.ssec) { SATIS.hastaId = b.dataset.ssec; ciz(); }
      else if (b.hasAttribute("data-scik")) { SATIS.hastaId = ""; SATIS.q = ""; ciz(); }
      else if (b.dataset.sod) { SATIS.odeme = b.dataset.sod; ciz(); }
      else if (b.hasAttribute("data-satkaydet")) satisKaydet();
    });
  },
  is(u, id) {
    const i = A().islem.find(x => x.id === id); if (!i) return;
    fotoAlanDoldur(u, i);
    u.querySelector(".ic").addEventListener("click", async e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.isod) { if (!izinVar("ödeme kaydı")) return; Object.assign(i, {odendi: true, odeme: b.dataset.isod, odemeTs: simdiTs()}, personelVar() ? {odemePer: kimSu().id, odemePerAd: kimSu().ad} : {}); await Veri.kaydet("islem", i); toast("Ödeme alındı · " + tl(i.toplam)); ciz(); }
      else if (b.dataset.isyik) { if (!izinVar("değişiklik")) return; i.yikayan = b.dataset.isyik; await Veri.kaydet("islem", i); ciz(); }
      else if (b.dataset.isfoto) izinVar("fotoğraf") && fotoSec(async blob => { await fotoKaydet(i.id, b.dataset.isfoto, blob); fotoAlanDoldur(u, i); toast("Fotoğraf eklendi"); });
      else if (b.hasAttribute("data-mikkaydet")) { if (!izinVar("değişiklik")) return; const m = {}; u.querySelectorAll("[data-mk]").forEach(x => { const p = x.dataset.mk; m[p] = m[p] || ["", ""]; m[p][+x.dataset.mi] = x.value; }); i.mikron = mikronTemiz(m); await Veri.kaydet("islem", i); toast("Ölçümler kaydedildi"); ciz(); }
      else if (b.dataset.garanti) garantiBelgesi(b.dataset.garanti);
      else if (b.dataset.fis) fisGoster(b.dataset.fis);
      else if (b.dataset.issil) { if (!izinVar("silme")) return; onay(`Bu kayıt silinsin mi? Kullanılan ürünler stoğa geri eklenir.${i.kurId && i.kurSira === 1 ? " Bu işte satılan paket de kapanır." : ""}`, async () => { await stokDegistir(i.kalemler, +1, i.id);
          if (i.kurId && i.kurSira === 1) { const h = hastaBul(i.hastaId), k = h && (h.kurler || []).find(x => x.id === i.kurId); if (k && k.pesin) { const diger = kurSeans(h.id, k.id).filter(x => x.id !== i.id); if (diger.length) Object.assign(k, {kapandi: simdiTs(), not: "satış kaydı silindi"}); else h.kurler = h.kurler.filter(x => x.id !== k.id); await Veri.kaydet("hasta", h); } } for (const f of (await Veri.fotolar()).filter(f => f.isId === i.id)) await Veri.fotoSil(f.id); await Veri.sil("islem", i.id); toast("Silindi"); git("ana"); }, true); }
    });
  },
  hastalar(u) {
    u.querySelector("#hAra").addEventListener("input", e => { HF.q = e.target.value; u.querySelector("#hListe").innerHTML = hastaListe(); });
  },
  malzemeler(u) {
    u.querySelector("#mAra").addEventListener("input", e => { MF.q = e.target.value; u.querySelector("#mListe").innerHTML = malzemeListe(); });
  },
  malzeme(u, id) {
    const yeni = id === "yeni" || id === "yeniurun", m = yeni ? null : A().malzeme.find(x => x.id === id);
    let grup = (m && m.grup) || (id === "yeniurun" ? "Ürün" : MF.g !== "Hepsi" && MF.g !== "Ürün" ? MF.g : "Yıkama"), tur = m ? (m.tur || "urun") : id === "yeniurun" ? "urun" : "hizmet";
    const sec = b => { grup = b.dataset.g; u.querySelectorAll("#mGrup [data-g]").forEach(x => x.classList.toggle("on", x === b)); };
    u.querySelector("#mGrup").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (b) sec(b); });
    u.querySelectorAll("#mTur [data-t]").forEach(b => b.onclick = () => { tur = b.dataset.t; u.querySelectorAll("#mTur [data-t]").forEach(x => x.classList.toggle("on", x === b));
      u.querySelector("#mHiz").style.display = tur === "hizmet" ? "grid" : "none"; u.querySelector("#mUrun").style.display = tur === "hizmet" ? "none" : "grid"; });
    u.querySelector("[data-gyeni]").onclick = () => perde(`<h3>Yeni grup</h3><label>Grup adı<input class="girdi" id="gY" placeholder="Grubun adı"></label><button class="btn koyu" id="gK">Ekle ve seç</button>`, s => {
      const i = s.querySelector("#gY"); i.focus();
      s.querySelector("#gK").onclick = async () => { const ad = i.value.trim().replace(/\s+/g, " "); if (ad.length < 2) return toast("Grup adını yazın");
        if (!gruplar().some(g => kucuk(g) === kucuk(ad))) await Veri.ayarYaz("gruplar", [...gruplar(), ad]);
        const ad2 = gruplar().find(g => kucuk(g) === kucuk(ad)); let b = [...u.querySelectorAll("#mGrup [data-g]")].find(x => x.dataset.g === ad2);
        if (!b) { b = document.createElement("button"); b.className = "cip"; b.dataset.g = ad2; b.textContent = ad2; u.querySelector("[data-gyeni]").before(b); }
        sec(b); kapat(); toast(`"${ad2}" grubu eklendi`); }; });
    ["mStokTut", "mSik"].forEach(k => u.querySelector("#" + k).onclick = e => { e.currentTarget.classList.toggle("on"); if (k === "mStokTut") u.querySelector("#mStokAlan").hidden = !e.currentTarget.classList.contains("on"); });
    const acik = k => u.querySelector("#" + k).classList.contains("on");
    u.querySelector("#mKaydet").onclick = async () => {
      if (!izinVar("liste değişikliği")) return;
      const v = k => (u.querySelector("#" + k) || {value: ""}).value.trim(), ad = v("mAd");
      if (ad.length < 2) return toast("Adını yazın");
      if (tur === "hizmet") {
        const f = [1, 2, 3, 4].map(k => sayi(v("mF" + k))), ilk = f.find(Boolean); if (!ilk) return toast("En az bir sınıfın fiyatını yazın");
        const f2 = f.map(x => x || ilk), o = Object.assign(m || {}, {ad, tur, grup, f: f2, satis: f2[1], alis: sayi(v("mMal")), garantiAy: Math.max(0, Math.round(sayi(v("mGar")))), bakimAy: Math.max(0, Math.round(sayi(v("mBak")))), stokTut: false, sik: acik("mSik")});
        await Veri.kaydet("malzeme", o);
      } else {
        const hedef = Math.round(sayi(v("mStok"))), once = m ? (+m.stok || 0) : 0;
        const o = Object.assign(m || {}, {ad, tur, grup, satis: sayi(v("mSatis")), alis: sayi(v("mAlis")), stokTut: acik("mStokTut"), sinir: Math.round(sayi(v("mSinir"))), sik: acik("mSik"), garantiAy: 0, bakimAy: 0}); delete o.f;
        await Veri.kaydet("malzeme", o); if (o.stokTut && hedef !== once) await stokHareket(o.id, hedef - once, "duzelt");
      }
      stokYenile(); toast("Kaydedildi"); git("malzeme");
    };
    const gb = u.querySelector("#mGiris"); if (gb) gb.onclick = () => stokGirisi(m);
    const sl = u.querySelector("#mSil"); if (sl) sl.onclick = () => izinVar("silme") && onay(`${m.ad} silinsin mi? (Eski işlerdeki kayıtlar durur.)`, async () => { await Veri.sil("malzeme", m.id); toast("Silindi"); git("malzeme"); }, true);
  },
  malzemeP(u, id) { const m = A().malzeme.find(x => x.id === id); const gb = u.querySelector("#mGiris"); if (gb && m) gb.onclick = () => stokGirisi(m); },
  kasa(u) {
    ["kA", "kB"].forEach(k => { const e = u.querySelector("#" + k); if (e) e.onchange = () => { KF[k === "kA" ? "a" : "b"] = e.value; ciz(); }; });
  }
};
const EYLEM = {
  geri: () => (history.length > 1 ? history.back() : git("ana")),
  yedek: () => yedekGonder().catch(e => toast("Yedek alınamadı: " + e.message)),
  excel: () => excelAktar(),
  kasaWa() { const no = waNo(Veri.ayar("isletmeTel")); window.open(`https://wa.me/${no}?text=${encodeURIComponent(kasaOzeti())}`, "_blank"); },
  async kopyala() { const k = Veri.ayar("cihaz"); try { await navigator.clipboard.writeText(k); toast("Cihaz kodu kopyalandı: " + k); } catch (e) { toast("Cihaz kodu: " + k); } },
  async lisansYenile() { toast("Denetleniyor…"); const ok = await Lisans.listeAl(); await lisansTazele(false); Lisans.bildir(SURUM); ciz(); toast(ok ? "Lisans güncel: " + OTURUM.durum.yaz : "İnternete bağlanılamadı · " + OTURUM.durum.yaz); },
  saticiya() { const m = `Merhaba, Esnaf Oto Detay Mobil için yazıyorum.\nİşletme: ${Veri.ayar("isletmeAd") || ""}\nCihaz kodu: ${Veri.ayar("cihaz") || ""}`; window.open(`https://wa.me/${SATICI_TEL}?text=${encodeURIComponent(m)}`, "_blank"); },
  unuttum() { perde(`<h3>Şifremi unuttum</h3>${personelVar() ? `<p class="kucuk"><b>Personelseniz:</b> yöneticinize söyleyin, Ayarlar → Personel'den size yeni şifre verir.</p>` : ""}<p class="kucuk">${personelVar() ? "<b>Yöneticiyseniz:</b> " : ""}Güvenlik için şifre sıfırlanamaz. Yedeğiniz varsa programı silip yeniden kurun ve yedeği, yedek alındığı zamanki şifreyle geri yükleyin. Yardım için satıcınıza yazın.</p><button class="btn koyu" data-a="saticiya">Satıcıya yaz</button><button class="btn ince" data-kapat>Kapat</button>`, s => s.querySelector("[data-kapat]").onclick = kapat); },
  isletme() {
    perde(`<h3>İşletme bilgileri</h3><label>İşletme adı<input class="girdi" id="iA" value="${esc(Veri.ayar("isletmeAd") || "")}"></label><label>İşletme telefonu<input class="girdi" id="iT" type="tel" value="${esc(Veri.ayar("isletmeTel") || "")}"></label><label>Adres (isteğe bağlı)<input class="girdi" id="iD" value="${esc(Veri.ayar("isletmeAdres") || "")}" placeholder="Açık adres"></label><button class="btn koyu" id="iK">Kaydet</button>`, s => {
      s.querySelector("#iK").onclick = async () => { const a = s.querySelector("#iA").value.trim(), t = s.querySelector("#iT").value.trim(); if (a.length < 2) return toast("Adı yazın"); if (t.replace(/\D/g, "").length < 10) return toast("Telefonu yazın");
        await Veri.ayarYaz("isletmeAd", a); await Veri.ayarYaz("isletmeTel", t); await Veri.ayarYaz("isletmeAdres", s.querySelector("#iD").value.trim()); await Veri.ayarYaz("sonBildirim", 0); Lisans.bildir(SURUM); kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  odeme() {
    const ciz3 = s => { const L = odemeTurleri(); s.querySelector("#oL").innerHTML = L.map((o, i) => `<div class="s"><input class="girdi" data-oi="${i}" value="${esc(o)}" style="padding:9px 12px"><button data-osil="${i}" style="color:var(--tehlike);font-size:20px;padding:0 8px" aria-label="Sil">×</button></div>`).join(""); };
    perde(`<h3>Ödeme türleri</h3><p class="kucuk">Yeni işlemde ve kasada bu adlar görünür. "Sonra" (ödenmedi) her zaman vardır.</p><div class="kart ayar" style="padding:2px 14px" id="oL"></div><button class="btn ince" id="oE">＋ Ödeme türü ekle</button><button class="btn koyu" id="oK">Kaydet</button>`, s => {
      ciz3(s);
      const oku = () => [...s.querySelectorAll("[data-oi]")].map(i => i.value.trim()).filter(Boolean);
      s.addEventListener("click", async e => { const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.osil) { const L = oku(); L.splice(+b.dataset.osil, 1); await Veri.ayarYaz("odemeTurleri", L); ciz3(s); }
        else if (b.id === "oE") { await Veri.ayarYaz("odemeTurleri", [...oku(), "Yeni ödeme türü"]); ciz3(s); const i = [...s.querySelectorAll("[data-oi]")].pop(); i.focus(); i.select(); }
        else if (b.id === "oK") { const L = [...new Set(oku())].filter(x => kucuk(x) !== "sonra"); if (!L.length) return toast("En az bir ödeme türü olmalı"); await Veri.ayarYaz("odemeTurleri", L); kapat(); toast("Kaydedildi"); ciz(); } });
    });
  },
  kategori() {
    if (!izinVar("kategori değişikliği")) return;
    const ciz3 = s => { s.querySelector("#cL").innerHTML = gruplar().map((g, i) => `<div class="s"><input class="girdi" data-ci="${i}" data-eski="${esc(g)}" value="${esc(g)}" style="padding:9px 12px"><span class="kucuk" style="white-space:nowrap;margin:0 6px">${A().malzeme.filter(m => m.grup === g).length} kalem</span><button data-csil="${i}" style="color:var(--tehlike);font-size:20px;padding:0 8px" aria-label="Sil">×</button></div>`).join(""); };
    perde(`<h3>Gruplar</h3><p class="kucuk">Adını değiştirince o gruptaki hizmet ve ürünler de değişir. İçinde kayıt olan grup silinince kayıtları ilk gruba taşınır.</p><div class="kart ayar" style="padding:2px 14px" id="cL"></div><button class="btn ince" id="cE">＋ Grup ekle</button><button class="btn koyu" id="cK">Kaydet</button>`, s => {
      ciz3(s);
      const kaydet = async () => {
        const yeni = [...s.querySelectorAll("[data-ci]")].map(i => ({eski: i.dataset.eski, ad: i.value.trim().replace(/\s+/g, " ")})).filter(x => x.ad);
        if (!yeni.length) { toast("En az bir grup olmalı"); return false; }
        for (const x of yeni) if (x.eski && x.eski !== x.ad) for (const m of A().malzeme.filter(m => m.grup === x.eski)) { m.grup = x.ad; await Veri.kaydet("malzeme", m); }
        await Veri.ayarYaz("gruplar", [...new Set(yeni.map(x => x.ad))]); return true;
      };
      s.addEventListener("click", async e => { const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.csil) { if (!(await kaydet())) return; const L = gruplar().slice(), sil = L.splice(+b.dataset.csil, 1)[0]; if (!L.length) return toast("En az bir grup olmalı");
          for (const m of A().malzeme.filter(m => m.grup === sil)) { m.grup = L[0]; await Veri.kaydet("malzeme", m); } await Veri.ayarYaz("gruplar", L); ciz3(s); }
        else if (b.id === "cE") { if (!(await kaydet())) return; await Veri.ayarYaz("gruplar", [...gruplar(), "Yeni grup"]); ciz3(s); const i = [...s.querySelectorAll("[data-ci]")].pop(); i.dataset.eski = ""; i.focus(); i.select(); }
        else if (b.id === "cK") { if (await kaydet()) { kapat(); toast("Kaydedildi"); ciz(); } } });
    });
  },
  ekipSifre(sonra) {
    perde(`<h3>Ekip şifresi</h3><p class="kucuk">Ekipteki herkes kendi telefonunda aynı şifreyi yazar. "Defteri paylaş" dosyası bu şifreyle kilitlenir; şifresi farklı telefon dosyayı açamaz. En az 6 karakter.</p>
      <label>Ekip şifresi<span class="pwkutu" style="position:relative;display:block"><input class="girdi" id="eS" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" style="-webkit-text-security:disc" value="${esc(Veri.ayar("ekipSifre") || "")}"><button type="button" id="eG" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:18px">👁</button></span></label>
      <button class="btn koyu" id="eK">Kaydet</button>`, s => {
      const i = s.querySelector("#eS"); i.focus();
      s.querySelector("#eG").onclick = () => { const a = i.style.webkitTextSecurity === "none"; i.style.webkitTextSecurity = a ? "disc" : "none"; };
      s.querySelector("#eK").onclick = async () => { const v = i.value.trim(); if (v.length < 6) return toast("Ekip şifresi en az 6 karakter olmalı"); await Veri.ayarYaz("ekipSifre", v); kapat(); toast("Ekip şifresi kaydedildi"); if (typeof sonra === "function") sonra(); else ciz(); }; });
  },
  async ekipPaylas() {
    if (!Veri.ayar("ekipSifre")) return EYLEM.ekipSifre(() => EYLEM.ekipPaylas());
    try { const d = new Date(), ad = `OtoDefteri-paylasim-${bugun()}-${saat(yerel(d)).replace(":", "")}.txt`;
      const s = await dosyaVer(ad, await Ekip.paket(Veri.ayar("ekipSifre")), "text/plain");
      if (s !== "vazgecildi") toast(s === "paylasildi" ? "Defter gönderildi · karşı telefonda Ayarlar → Gelen defteri birleştir" : "Dosya indirildi · WhatsApp'tan gönderin"); }
    catch (e) { toast("Paylaşılamadı: " + e.message); }
  },
  ekipBirlestir() {
    if (!izinVar("birleştirme")) return;
    const inp = document.createElement("input"); inp.type = "file";
    inp.onchange = async () => { const f = inp.files[0]; if (!f) return; ekipAc(await f.text()); };
    inp.click();
  },
  kasaTeslim: () => kasaTeslim(),
  siparis: () => siparisListesi(),
  kilitle() { OTURUM.acik = false; OTURUM.pin = ""; OTURUM.kim = null; kapat(); ciz(); },
  personel() {
    const L = personeller();
    perde(`<h3>Personel</h3><p class="kucuk">Ortak telefon ya da tablette herkes kendi şifresiyle (4–8 rakam) girer. Her işlemde kimin girdiği yazar. Personel; araç alır, durumunu değiştirir, teslim eder, ödeme alır, ürün satar ve stok girişi yapar. Maliyet, kâr, alış fiyatı, Excel, fiyat değişikliği, silme ve ayarlar yalnız yöneticide (sizin şifreniz).</p>
      <div class="kart liste">${L.map(p => `<button class="s" data-pd="${p.id}" style="width:100%;text-align:left"><span class="av ${renk(p.ad)}">${esc(bas(p.ad))}</span><div class="m"><b>${esc(p.ad)}</b><small>${A().islem.filter(i => i.per === p.id).length} işlem</small></div><span class="ok">›</span></button>`).join("") || `<div class="bos-durum">Henüz personel yok</div>`}</div>
      <button class="btn koyu" id="pE">＋ Personel ekle</button><button class="btn ince" data-kapat>Kapat</button>`, s => {
      s.querySelector("[data-kapat]").onclick = kapat; s.querySelector("#pE").onclick = () => personelDuzen("");
      s.querySelectorAll("[data-pd]").forEach(b => b.onclick = () => personelDuzen(b.dataset.pd)); });
  },
  pin() {
    if (!yon()) return perde(`<h3>Şifremi değiştir</h3><label>Mevcut şifre<input class="girdi" id="p0" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><div class="ikili-g"><label>Yeni şifre<input class="girdi" id="p1" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><label>Yeni (tekrar)<input class="girdi" id="p2" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label></div><button class="btn koyu" id="pK">Kaydet</button>`, s => {
      s.querySelector("#pK").onclick = async () => { const p0 = s.querySelector("#p0").value, p1 = s.querySelector("#p1").value, p2 = s.querySelector("#p2").value, p = personeller().find(x => x.id === OTURUM.kim.id);
        if (!p || await pinOzet(p0, new Uint8Array(p.pin.t)) !== p.pin.h) return toast("Mevcut şifre yanlış"); if (!/^\d{4,8}$/.test(p1)) return toast("Yeni şifre 4–8 rakam olmalı"); if (p1 !== p2) return toast("Yeni şifreler aynı değil");
        if (await pinKullanimda(p1, p.id)) return toast("Bu şifre kullanılamaz · başka bir şifre seçin");
        const tuz = crypto.getRandomValues(new Uint8Array(16)); p.pin = {t: [...tuz], h: await pinOzet(p1, tuz), u: p1.length}; if (OTURUM.pin) p.sar = await sar(OTURUM.pin, p1); else delete p.sar;
        await Veri.ayarYaz("personel", personeller().map(x => x.id === p.id ? p : x)); kapat(); toast("Şifreniz değişti"); }; });
    perde(`<h3>Giriş şifresini değiştir</h3><label>Mevcut şifre<input class="girdi" id="p0" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><div class="ikili-g"><label>Yeni şifre<input class="girdi" id="p1" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><label>Yeni (tekrar)<input class="girdi" id="p2" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label></div>
      <label>Arka planda kaç dakika kalınca kilitlensin<select class="girdi" id="pD">${[1, 2, 5, 15].map(n => `<option ${+(Veri.ayar("kilitDk") || 2) === n ? "selected" : ""}>${n}</option>`).join("")}</select></label><p class="kucuk">Not: eski yedekler, alındıkları zamanki şifreyle açılır.</p><button class="btn koyu" id="pK">Kaydet</button>`, s => {
      s.querySelector("#pK").onclick = async () => { const p0 = s.querySelector("#p0").value, p1 = s.querySelector("#p1").value, p2 = s.querySelector("#p2").value;
        await Veri.ayarYaz("kilitDk", +s.querySelector("#pD").value);
        if (p0 || p1) { if (!(await pinDogru(p0))) return toast("Mevcut şifre yanlış"); if (!/^\d{4,8}$/.test(p1)) return toast("Yeni şifre 4–8 rakam olmalı"); if (p1 !== p2) return toast("Yeni şifreler aynı değil");
          if (await pinKullanimda(p1, "y")) return toast("Bu şifreyi bir personel kullanıyor · başka bir şifre seçin");
          if (personelVar()) await Veri.ayarYaz("ypZincir", [...(Veri.ayar("ypZincir") || []), await sar(p1, p0)].slice(-30));          // personelin sakladığı eski yönetici şifresi yenisine ulaşır
          await pinKaydet(p1); OTURUM.pin = p1; }
        kapat(); toast("Kaydedildi"); ciz(); }; });
  },
  google() {
    if (!googleBagli()) return googleBaglan(false);
    const g = Veri.ayar("google");
    perde(`<h3>Google · ${esc(g.e)}</h3><p class="kucuk">Yedek, Google Drive'ınızda yalnız bu programın görebildiği gizli klasörde şifreli durur. Kayıt yaptıkça kendiliğinden güncellenir; günde bir "Şimdi yedekle" hatırlatması çıkabilir.</p>
      <button class="btn koyu" data-a="driveYedek">☁ Şimdi Drive'a yedekle</button><button class="btn ince" data-a="driveGeri">Drive'dan geri yükle</button><button class="btn ince" id="gK" style="color:var(--tehlike)">Bağlantıyı kaldır</button><button class="btn ince" data-kapat>Kapat</button>`, s => {
      s.querySelector("[data-kapat]").onclick = kapat;
      s.querySelector("#gK").onclick = () => onay("Google bağlantısı kaldırılsın mı? (Drive'daki yedek silinmez)", async () => { await Google.kopar(); toast("Bağlantı kaldırıldı"); ciz(); }); });
  },
  driveYedek: () => driveYedekle(false),
  async driveGeri() { try { const m = await Google.yedekOku(); if (!m) return toast("Drive'da yedek yok"); driveGeriYukleSor(m); } catch (e) { if (e.izin) googleIzinPerde(); else toast(e.message); } },
  googleKurulum: () => googleBaglan(true),
  geriyukle() {
    const inp = document.createElement("input"); inp.type = "file";          // 1.1.0: tür sınırı yok (iPhone bilinmeyen uzantıyı seçtirmiyordu)
    inp.onchange = async () => { const f = inp.files[0]; if (!f) return; const metin = await f.text();
      perde(`<h3>Yedekten geri yükle</h3><p class="kucuk">${esc(f.name)} · bu telefondaki bütün kayıtların YERİNE geçer.</p><label>Yedeğin şifresi (yedek alındığı zamanki giriş şifresi)<input class="girdi" id="yS" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><p class="hata" id="yH"></p><button class="btn ana" id="yK">Geri yükle</button><button class="btn ince" data-kapat>Vazgeç</button>`, s => {
        s.querySelector("[data-kapat]").onclick = kapat; s.querySelector("#yS").focus();
        s.querySelector("#yK").onclick = async () => { try { const y = await yedekCoz(metin, s.querySelector("#yS").value); await Veri.iceAl(y); stokYenile(); OTURUM.pin = s.querySelector("#yS").value; await pinKaydet(OTURUM.pin); await lisansTazele(false); await fotoYetimTemizle(); kapat(); toast(`Geri yüklendi · ${A().hasta.length} araç, ${A().islem.length} iş`); git("ana"); } catch (e) { s.querySelector("#yH").textContent = e.message; } }; }); };
    inp.click();
  }
};

Object.assign(EYLEM, EYLEM_OTO);
function personelDuzen(id) {
  const p = id ? personeller().find(x => x.id === id) : {ad: ""};
  perde(`<h3>${id ? esc(p.ad) : "Yeni personel"}</h3><label>Adı<input class="girdi" id="pA" value="${esc(p.ad)}" placeholder="Ad soyad"></label>
    <div class="ikili-g"><label>${id ? "Yeni şifre (değişmeyecekse boş)" : "Şifresi (4–8 rakam)"}<input class="girdi" id="p1" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label><label>Şifre (tekrar)<input class="girdi" id="p2" type="tel" inputmode="numeric" maxlength="8" style="-webkit-text-security:disc"></label></div>
    <p class="kucuk">Şifreyi personele siz söyleyin; sonra kendisi Ayarlar'dan değiştirebilir.</p>
    <button class="btn koyu" id="pK">Kaydet</button>${id ? `<button class="btn ince" id="pS" style="color:var(--tehlike)">Personeli kaldır (işlemleri durur)</button>` : ""}<button class="btn ince" data-kapat>Vazgeç</button>`, s => {
    s.querySelector("[data-kapat]").onclick = () => EYLEM.personel(); s.querySelector("#pA").focus();
    s.querySelector("#pK").onclick = async () => {
      const ad = s.querySelector("#pA").value.trim().replace(/\s+/g, " "), p1 = s.querySelector("#p1").value, p2 = s.querySelector("#p2").value;
      if (ad.length < 2) return toast("Adını yazın"); if (kucuk(ad) === kucuk(YON_AD) || personeller().some(x => x.id !== id && kucuk(x.ad) === kucuk(ad))) return toast("Bu ad kullanılıyor");
      if (!id || p1) { if (!/^\d{4,8}$/.test(p1)) return toast("Şifre 4–8 rakam olmalı"); if (p1 !== p2) return toast("Şifreler aynı değil"); if (await pinKullanimda(p1, id || "-")) return toast("Bu şifre kullanılıyor · başka bir şifre seçin"); }
      const o = Object.assign({}, p, {id: id || Veri.yeniId(), ad});
      if (p1) { const tuz = crypto.getRandomValues(new Uint8Array(16)); o.pin = {t: [...tuz], h: await pinOzet(p1, tuz), u: p1.length}; o.sar = await sar(OTURUM.pin, p1); }
      await Veri.ayarYaz("personel", id ? personeller().map(x => x.id === id ? o : x) : [...personeller(), o]);
      toast(id ? "Kaydedildi" : `${ad} eklendi · şifresini kendisine söyleyin`); EYLEM.personel(); };
    const sl = s.querySelector("#pS"); if (sl) sl.onclick = () => onay(`${p.ad} kaldırılsın mı? Girdiği işlemler silinmez.`, async () => { await Veri.ayarYaz("personel", personeller().filter(x => x.id !== id)); toast("Kaldırıldı"); EYLEM.personel(); }, true);
  });
}
const YON_EYLEM = new Set(["googleYorum", "isletme", "odeme", "kategori", "google", "driveGeri", "geriyukle", "excel", "kasaWa", "personel", "siniflar", "paketler", "sadakat", "prim", "hazirMesaj", "garantiSart", "calisanlar"]);
document.addEventListener("click", e => {
  const t = e.target.closest("[data-git],[data-a],[data-hduz],[data-hyenikart],[data-hf],[data-mg],[data-kd],[data-durum],[data-kurseans],[data-kurbitir],[data-kontkapat],[data-garanti2],[data-borcode],[data-aracfoto],[data-ozl]");
  if (!t || t.closest(".perde") && !t.dataset.a) return;
  if (t.dataset.durum) return durumDegis(t.dataset.durum, t.dataset.d);
  if (t.dataset.ozl) { const g = Object.assign({}, Veri.ayar("ozledik") || {}); g[t.dataset.ozl] = bugun(); Veri.ayarYaz("ozledik", g).then(() => setTimeout(ciz, 400)); return; }          // bağlantı WhatsApp'ı açar
  if (t.dataset.aracfoto) return aracFotoSec(t.dataset.aracfoto);
  if (t.dataset.hfgit) HF.f = t.dataset.hfgit;
  if (t.dataset.git !== undefined) {
    if (t.dataset.git.startsWith("yeni")) { if (!izinVar("araç kaydı")) return; yeniSifirla(t.dataset.git.split("/")[1] || ""); }
    if (t.dataset.git === "satis") { if (!izinVar("satış")) return; Object.assign(SATIS, {adet: {}, hastaId: "", q: "", odeme: ""}); }
    if (/^malzeme\/yeni/.test(t.dataset.git) && (!yon() || !izinVar("yeni kayıt"))) return;
    return git(t.dataset.git);
  }
  if (t.dataset.a && YON_EYLEM.has(t.dataset.a) && !yon()) return toast("Bunu yalnız yönetici yapabilir");
  if (t.dataset.a && EYLEM[t.dataset.a]) { if (t.closest(".perde")) kapat(); return EYLEM[t.dataset.a](); }
  if (t.dataset.kurseans) { if (!izinVar("araç kaydı")) return; const h = hastaBul(t.dataset.h), k = h && (h.kurler || []).find(x => x.id === t.dataset.kurseans); if (!k) return; yeniSifirla(h.id); kurDoldur(h, k); return git("yeni"); }
  if (t.dataset.kurbitir) { const h = hastaBul(t.dataset.h), k = h && (h.kurler || []).find(x => x.id === t.dataset.kurbitir); if (!k || !izinVar("paket değişikliği")) return;
    return onay(`${k.ad} kapatılsın mı? Kullanılan yıkamalar kayıtlı kalır, kalanlar kullanılamaz.`, async () => { k.kapandi = simdiTs(); await Veri.kaydet("hasta", h); toast("Paket kapatıldı"); ciz(); }); }
  if (t.dataset.kontkapat) { const i = A().islem.find(x => x.id === t.dataset.kontkapat); if (!i || !izinVar("hatırlatma kapatma")) return; i.kontrolKapandi = true; Veri.kaydet("islem", i).then(() => { toast("Hatırlatma kapatıldı"); ciz(); }); return; }
  if (t.dataset.garanti2) return garantiBelgesi(t.dataset.garanti2);
  if (t.dataset.borcode) return borcTahsil(t.dataset.borcode);
  if (t.dataset.hduz) return hastaDuzenle(t.dataset.hduz);
  if (t.hasAttribute("data-hyenikart")) return hastaDuzenle("");
  if (t.dataset.hf) { HF.f = t.dataset.hf; return ciz(); }
  if (t.dataset.mg) { MF.g = t.dataset.mg; return ciz(); }
  if (t.dataset.kd) { KF.d = t.dataset.kd; return ciz(); }
});
// ---------------------------------------------------------------- açılış
(async () => {
  try {
    await Veri.yukle(); stokYenile(); await aracFotoYukle(); await Lisans.hazirla(); OTURUM.durum = await Lisans.durum();
    setInterval(() => { if (OTURUM.acik && YOL()[0] === "ana" && !document.querySelector(".perde") && !document.hidden) ciz(); }, 60e3);          // bekleme süreleri
    if (GOOGLE_CLIENT_ID && navigator.onLine !== false) Google.hazirla();          // 1.2.1: kütüphane önceden yüklensin; yoksa ilk "Bağla" dokunuşunda iPhone pencereyi engelliyordu
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
    ciz();
  } catch (e) { $("#uyg").innerHTML = `<div class="kilit"><div class="logo">!</div><b>Program açılamadı</b><p class="kucuk">${esc(e.message)}. Tarayıcının gizli (özel) penceresinde veri saklanamaz; normal pencerede açın.</p></div>`; }
})();

