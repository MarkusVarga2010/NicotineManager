# NicotineManager – Alles was du brauchst

## Ordnerinhalt

**Für GitHub (App-Dateien, alle 5 hochladen):**
- `index.html` – die App selbst (Design, Logik, alles)
- `config.js` – deine Supabase-Zugangsdaten (URL + Key)
- `manifest.json` – PWA-Manifest
- `sw.js` – Service Worker (Version hochzählen bei jedem Update!)
- `schema.sql` – Datenbank-Struktur. **Nur für die Erst-Einrichtung
  oder einen kompletten Reset** – löscht beim Ausführen ALLE
  bestehenden Daten und legt alles neu an, inkl. Standard-Konten
  `admin/1234`, `boss/geheim`, `service/service123`.

**Ordner `sql-hilfsskripte/` (einzeln bei Bedarf in Supabase ausführen):**
- `update_first_login.sql` – Patch, damit Spezial-Konten die
  Einführungstour beim ersten Login bekommen. Löscht keine Daten.
- `create_special_account.sql` – legt ein neues Spezial-/Lieferant-
  Konto an (Benutzername/Passwort vorher anpassen).
- `fix_create_app_user.sql` – behebt den Fehler "create_app_user is
  not unique" und legt danach direkt ein Spezial-Konto an.

## Einrichtung von null (frisches Supabase-Projekt)

1. Supabase-Projekt anlegen, unter **Settings → API** URL + anon key
   kopieren und in `config.js` eintragen.
2. **SQL Editor** → Inhalt von `schema.sql` einfügen → **Run**.
3. Die 5 App-Dateien (nicht den `sql-hilfsskripte`-Ordner) ins
   GitHub-Repo hochladen.
4. Im Browser aufrufen, mit `admin` / `1234` einloggen.

## Neuen Lieferant/Spezial-Account anlegen

**Ohne SQL:** In der App als `admin` einloggen → Einstellungen →
Karte "Benutzer" → Rolle "Spezial-Konto" → anlegen.

**Mit SQL:** Inhalt von `sql-hilfsskripte/create_special_account.sql`
anpassen (Benutzername/Passwort) und in Supabase ausführen.

## Bei jedem künftigen Update von index.html

In `sw.js` die Zahl bei `APP_VERSION` erhöhen (z. B. 2.1.0 → 2.1.1),
sonst merkt der Browser die neue Version nicht und zeigt weiter die
alte gecachte Version an.
