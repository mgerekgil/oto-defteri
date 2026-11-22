/* Esnaf Oto Detay Mobil — Google ile bağla (isteğe bağlı). Kullanıcının KENDİ Drive'ında, yalnız bu programın görebildiği gizli klasöre (appDataFolder)
   oto-kimlik.json (cihaz kodu + yedek gizi), oto-yedek.kdy (şifreli yedek) ve fotoğraflar (oto-foto__…jpg) yazılır. Bizim sunucumuz yok; müşteri verisi bize hiç gelmez. */
"use strict";
const Google = (() => {
  const KAPSAM = "https://www.googleapis.com/auth/drive.appdata openid email";
  const DRIVE = "https://www.googleapis.com/drive/v3/files", YUKLE = "https://www.googleapis.com/upload/drive/v3/files";
  let jeton = null, jetonSon = 0, istemci = null;

  function kutuphane() {
    if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
    return new Promise((ok, hata) => {
      const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true;
      s.onload = () => ok(); s.onerror = () => hata(new Error("Google'a bağlanılamadı (internet?)"));
      document.head.appendChild(s);
    });
  }
  // Kullanıcı dokunuşuyla çağrılmalı (tarayıcı açılır pencereyi ancak öyle açar)
  async function jetonAl(sessiz) {
    if (jeton && Date.now() < jetonSon - 60e3) return jeton;
    if (sessiz) return null;
    await kutuphane();
    return new Promise((ok, hata) => {
      istemci = google.accounts.oauth2.initTokenClient({client_id: GOOGLE_CLIENT_ID, scope: KAPSAM,
        callback: r => { if (r && r.access_token) { jeton = r.access_token; jetonSon = Date.now() + (+r.expires_in || 3600) * 1000; ok(jeton); } else hata(new Error("Google girişi yapılmadı")); },
        error_callback: e => hata(new Error(e && e.type === "popup_closed" ? "Google penceresi kapatıldı" : "Google girişi yapılamadı"))});
      const g = Veri.ayar("google");
      istemci.requestAccessToken(g && g.e ? {prompt: "", login_hint: g.e} : {});
    });
  }
  async function istek(url, ayar = {}) {
    const r = await fetch(url, Object.assign({}, ayar, {headers: Object.assign({Authorization: "Bearer " + jeton}, ayar.headers || {})}));
    if (r.status === 401) { jeton = null; throw new Error("Google oturumu düştü, yeniden bağlanın"); }
    if (!r.ok) throw new Error("Google Drive hatası " + r.status);
    return r;
  }
  async function bul(ad) {
    const q = encodeURIComponent(`name='${ad}' and trashed=false`);
    const j = await (await istek(`${DRIVE}?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`)).json();
    return (j.files || [])[0] || null;
  }
  async function oku(ad) { const f = await bul(ad); return f ? {f, metin: await (await istek(`${DRIVE}/${f.id}?alt=media`)).text()} : null; }
  async function yaz(ad, metin, tur) {
    const f = await bul(ad), sinir = "kd" + Math.random().toString(36).slice(2);
    const meta = f ? {name: ad} : {name: ad, parents: ["appDataFolder"]};
    const govde = `--${sinir}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${sinir}\r\nContent-Type: ${tur}\r\n\r\n${metin}\r\n--${sinir}--`;
    return (await istek(f ? `${YUKLE}/${f.id}?uploadType=multipart` : `${YUKLE}?uploadType=multipart`, {method: f ? "PATCH" : "POST", headers: {"Content-Type": "multipart/related; boundary=" + sinir}, body: govde})).json();
  }

  // Bağlan: hesap bilgisi + kimlik.json. Drive'da kayıtlı kod varsa onu alır (silip kurmak / yeni telefon kodu değiştirmez).
  async function baglan() {
    await jetonAl(false);
    const u = await (await istek("https://www.googleapis.com/oauth2/v3/userinfo")).json();
    const k = await oku("oto-kimlik.json");
    let kimlik = null; try { kimlik = k && JSON.parse(k.metin); } catch (e) { kimlik = null; }
    let degisti = false;
    if (kimlik && kimlik.kod && kimlik.giz) {
      if (kimlik.kod !== Veri.ayar("cihaz")) { await Veri.ayarYaz("cihaz", kimlik.kod); if (kimlik.ilk) await Veri.ayarYaz("ilk", kimlik.ilk); degisti = true; }
    } else {
      kimlik = {kod: Veri.ayar("cihaz"), ilk: Veri.ayar("ilk"), giz: [...crypto.getRandomValues(new Uint8Array(24))].map(x => x.toString(16).padStart(2, "0")).join(""), t: new Date().toISOString()};
      await yaz("oto-kimlik.json", JSON.stringify(kimlik), "application/json");
    }
    await Veri.ayarYaz("google", {e: u.email || "", s: u.sub || "", giz: kimlik.giz, t: new Date().toISOString()});
    return {email: u.email, kodDegisti: degisti};
  }
  async function yedekBilgi() { await jetonAl(false); const f = await bul("oto-yedek.kdy"); return f; }
  async function yedekYaz(metin) { await yaz("oto-yedek.kdy", metin, "application/octet-stream"); await Veri.ayarYaz("sonDrive", new Date().toISOString()); }
  async function yedekOku() { await jetonAl(false); const r = await oku("oto-yedek.kdy"); return r ? r.metin : null; }
  // 1.1.0: fotoğraflar ayrı dosyalar olarak (ad: oto-foto__<kimlik>__<iş/araç>__<tür>__<zaman>.jpg); yedek dosyasını büyütmez
  const fotoAd = f => `oto-foto__${f.id}__${f.isId}__${f.tur}__${String(f.ts || "").replace(/[^0-9T]/g, "")}.jpg`;
  async function fotoYukle(f) {
    const sinir = "kd" + Math.random().toString(36).slice(2), meta = {name: fotoAd(f), parents: ["appDataFolder"]};
    const govde = new Blob([`--${sinir}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${sinir}\r\nContent-Type: image/jpeg\r\n\r\n`, f.blob, `\r\n--${sinir}--`]);
    return (await istek(`${YUKLE}?uploadType=multipart`, {method: "POST", headers: {"Content-Type": "multipart/related; boundary=" + sinir}, body: govde})).json();
  }
  async function fotoListe() {
    const out = []; let sayfa = "";
    do { const q = encodeURIComponent("name contains 'oto-foto__' and trashed=false");
      const j = await (await istek(`${DRIVE}?spaces=appDataFolder&q=${q}&pageSize=1000&fields=nextPageToken,files(id,name)${sayfa ? "&pageToken=" + sayfa : ""}`)).json();
      out.push(...(j.files || [])); sayfa = j.nextPageToken || ""; } while (sayfa);
    return out.map(x => { const [, id, isId, tur, ts] = x.name.replace(/\.jpg$/, "").split("__"); return {driveId: x.id, id, isId, tur, ts: ts ? ts.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*$/, "$1-$2-$3T$4:$5:$6") : ""}; }).filter(x => x.id && x.isId);
  }
  async function fotoIndir(driveId) { return (await istek(`${DRIVE}/${driveId}?alt=media`)).blob(); }
  async function fotoSil(driveId) { try { await istek(`${DRIVE}/${driveId}`, {method: "DELETE"}); } catch (e) { /* önemsiz */ } }
  async function kopar() {
    try { if (jeton && window.google && google.accounts) google.accounts.oauth2.revoke(jeton, () => {}); } catch (e) { /* önemsiz */ }
    jeton = null; await Veri.ayarYaz("google", null);
  }
  return {baglan, yedekBilgi, yedekYaz, yedekOku, kopar, fotoYukle, fotoListe, fotoIndir, fotoSil, jetonVar: () => !!(jeton && Date.now() < jetonSon - 60e3), jetonAl};
})();
