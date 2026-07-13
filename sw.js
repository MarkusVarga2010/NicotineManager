// NicotineManager Service Worker
// Versionsnummer hochzählen, wenn sich index.html / Assets ändern -> erzwingt Update beim nächsten Start.
const APP_VERSION = '12.0.0'; // Menü läuft jetzt ausschließlich über den Hamburger/die Seitenleiste (keine separate mobile Tableiste mehr), Lagerbestand hat jetzt einen eigenen Menüpunkt/eigene Seite (statt Badge auf "Preise"). Außerdem: Abholcode-Rundumschlag — QR-Code zusätzlich zum 4-stelligen Code (anzeigen + per Kamera scannen), Teilen über die native Share-Funktion des Geräts (WhatsApp/Signal/SMS/AirDrop/Mail statt fest verdrahtetem WhatsApp-Link), "wartet seit X Tagen"-Hinweis mit direktem Erinnerungs-Button, Direktlink zum Selbst-Vorzeigen des Codes ohne Login, echte 30s-Sperre nach 5 Fehlversuchen (statt nur Warnhinweis), Status-Timeline im Bestell-Detail, automatischer Ablauf von Codes nach 60 Tagen, optionales "Wer holt ab?"-Notizfeld, Sammel-Abholung für mehrere offene Bestellungen desselben Kunden auf einmal, und eine Abholstatistik (Ø Abholzeit) im Dashboard. Alle Tabellen/Spalten/IDs unverändert — keine neue Datenbank-Spalte oder -Tabelle nötig.
const CACHE_NAME = 'nicotinemanager-' + APP_VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/favicon.png',
];
// Installation: neue Version cachen, aber noch nicht aktivieren (wartet auf Bestätigung der Seite)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});
// Aktivierung: alte Caches (vorherige Versionen) aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});
// Fetch-Strategie: Netzwerk zuerst (für aktuelle Daten/Updates), Cache als Fallback (offline).
// WICHTIG: Anfragen an Supabase werden NIE gecacht — die Geschäftsdaten müssen
// immer live sein (das schließt auch die Storage-API mit ein, über die Varianten-Bilder
// hoch- und heruntergeladen werden). Nur die eigenen App-Dateien (HTML/CSS/JS/Icons)
// profitieren vom Offline-Cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('.supabase.co')) return; // an Supabase: immer direkt ans Netzwerk, nie cachen
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
// Erlaubt der Seite, den Service Worker sofort zu aktivieren (nach Update-Bestätigung durch Nutzer)
// UND stellt der Seite die aktuelle APP_VERSION zur Verfügung, damit index.html
// (z.B. im "Über die App"-Bereich und im Update-Banner) nie eine veraltete/hartkodierte
// Versionsnummer anzeigt, sondern immer die echte Version aus dieser Datei.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: APP_VERSION });
  }
});
