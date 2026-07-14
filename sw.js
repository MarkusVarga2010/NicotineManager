// NicoFlow Service Worker
// Versionsnummer hochzählen, wenn sich index.html / Assets ändern -> erzwingt Update beim nächsten Start.
const APP_VERSION = '13.8.1'; // Schriftart der Lagerbestand-Übersicht (Donut-Zahl) korrigiert: nutzt jetzt wie überall sonst (z.B. auf der Übersicht/Dashboard-Seite bei den Kennzahlen-Kacheln) JetBrains Mono statt der Überschriften-Schriftart, damit alle großen Zahlen im gesamten App konsistent aussehen.
const CACHE_NAME = 'nicoflow-' + APP_VERSION;
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
