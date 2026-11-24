# Kontakter – eksempelapp for JavaScript Grunnkurs

En liten, komplett CRUD-app som viser hvordan en Node-app **henter og lagrer data i
PostgreSQL**. Appen er undervisningsmateriell for kurset _JavaScript Grunnkurs_ hos
ITFakultetet, og er skrevet for å leses: korte kommentarer på norsk forklarer _hvorfor_
koden er gjort slik den er.

Du får:

- **Server-rendrede sider** med Express 5 og EJS – de virker helt uten JavaScript
- **Et JSON-API** under `/api/kontakter` som frontend bruker til live-søk og sletting
- **Server-side validering** med zod, med feltvise feilmeldinger og bevarte verdier
- **PostgreSQL** med parameteriserte spørringer, tilkoblingspool og en trigger som holder
  `endret` oppdatert
- **Tester** med Nodes innebygde testrunner + supertest, mot en ekte database
- **Moderne, lyst grensesnitt** (Bootstrap 5.3 fra npm, ingen CDN) med toast, modal og
  debounce-søk

---

## 1. Krav

| Du trenger | Versjon                | Merknad                                    |
| ---------- | ---------------------- | ------------------------------------------ |
| Node.js    | 22 eller nyere         | `node --version`                           |
| npm        | 10 eller nyere         | følger med Node                            |
| Docker     | valgfritt, men enklest | brukes til å kjøre PostgreSQL lokalt       |
| PostgreSQL | 17                     | hvis du heller vil bruke en du har fra før |

---

## 2. Kom i gang på fem steg

```bash
# 1. Start en PostgreSQL 17 i Docker (databasen «jsgk» blir til automatisk)
docker compose up -d

# 2. Installer avhengighetene
npm install

# 3. Lag din egen konfigurasjon – og bytt passordet i DATABASE_URL
cp .env.example .env

# 4. Lag tabellen og legg inn 12 eksempelkontakter
npm run db:init

# 5. Start appen (starter på nytt automatisk når du endrer en fil)
npm run dev
```

Åpne <http://localhost:3000>.

> **Passordet må stemme.** `docker-compose.yml` bruker standardpassordet `jsgk_dev_pw`
> for lokal utvikling. Bruker du det, skal linjen i `.env` se slik ut:
>
> ```env
> DATABASE_URL=postgres://jsgk:jsgk_dev_pw@localhost:5432/jsgk
> ```
>
> Vil du bruke et annet passord, sett `POSTGRES_PASSWORD` i miljøet før du kjører
> `docker compose up -d`, og bruk samme passord i `DATABASE_URL`.

Har du allerede en PostgreSQL du vil bruke, hopper du over steg 1 og setter
`DATABASE_URL` til din egen database. `npm run db:init` lager tabellen selv.

### Nyttige kommandoer

| Kommando                 | Hva den gjør                                                         |
| ------------------------ | -------------------------------------------------------------------- |
| `npm run dev`            | Starter appen med `node --watch` (restart ved filendring)            |
| `npm start`              | Starter appen uten watch – slik den kjøres i produksjon              |
| `npm run db:init`        | Kjører `sql/01-skjema.sql` og `sql/02-seed.sql`. Kan kjøres om igjen |
| `npm test`               | Kjører alle testene                                                  |
| `npm run lint`           | ESLint på all JavaScript                                             |
| `npm run format`         | Formaterer koden med Prettier                                        |
| `npm run format:check`   | Sjekker formatering uten å endre filer                               |
| `docker compose down`    | Stopper databasen (dataene beholdes i et volum)                      |
| `docker compose down -v` | Stopper databasen **og sletter alle data**                           |

---

## 3. Kjøre testene

```bash
npm test
```

Testene bruker Nodes innebygde testrunner (`node:test`) og `supertest`, som sender
HTTP-forespørsler rett til appen – uten å starte en server på en port.

De dekker:

- liste, paginering, søk, sortering og `perSide`-begrensning
- henting av én kontakt, og 404 for ukjent eller ugyldig id
- oppretting (201 + `Location`), normalisering av e-post, tomme felt blir `NULL`
- valideringsfeil (400) med feil per felt
- duplikat e-post (409) – også når bokstavene er forskjellige
- oppdatering, sletting (204) og at slettede kontakter gir 404
- at sorteringsparameteren ikke kan brukes til SQL-injeksjon
- at de server-rendrede sidene svarer med riktig innhold og statuskode
- valideringsreglene hver for seg (enhetstester, uten database)

> **Merk:** testene **tømmer tabellen `kontakter`** og legger inn seed-data på nytt, slik
> at de skal gi samme resultat hver gang. Kjør dem derfor aldri mot en database du er
> redd for. Testene nekter å kjøre hvis `NODE_ENV=production`.

Testkjøringen bruker `.env`, men lar `.env.test` overstyre den (der settes
`NODE_ENV=test` og et lavere loggnivå). Det er derfor `npm test`-scriptet laster to
env-filer.

---

## 4. Prosjektstruktur

```
minApp/
├── package.json              # avhengigheter og script
├── .env.example              # mal for miljøvariabler (bare plassholdere)
├── .env.test                 # overstyrer .env under npm test (ingen hemmeligheter)
├── .gitignore                # .env og node_modules skal ALDRI i git
├── eslint.config.js          # ESLint 10, flat config
├── .prettierrc               # formateringsregler
├── docker-compose.yml        # PostgreSQL 17 med healthcheck og volum
│
├── sql/
│   ├── 01-skjema.sql         # tabellen kontakter, unik indeks på lower(epost), trigger
│   └── 02-seed.sql           # 12 norske eksempelkontakter (ON CONFLICT DO NOTHING)
│
├── scripts/
│   └── db-init.js            # «npm run db:init» – kjører SQL-filene via pg
│
├── src/
│   ├── server.js             # starter HTTP-serveren, graceful shutdown, feilnett
│   ├── app.js                # Express-oppsett: sikkerhet, statiske filer, ruter, feil
│   ├── config.js             # leser og validerer miljøvariabler
│   ├── logger.js             # pino (pino-pretty kun under utvikling)
│   ├── db.js                 # pg.Pool, query(), withTransaction(), closePool()
│   ├── repositories/
│   │   └── kontakter.js      # ALL SQL – parameteriserte spørringer og hviteliste
│   ├── validators/
│   │   └── kontakter.js      # zod-skjema + validerKontakt()
│   ├── routes/
│   │   ├── sider.js          # server-rendrede sider (HTML-skjemaer)
│   │   └── api.js            # JSON-API under /api/kontakter
│   ├── middleware/
│   │   └── errors.js         # 404 og sentral feilbehandler
│   └── views/
│       ├── partials/         # head, navbar, flash, footer
│       ├── oversikt.ejs      # kontaktlisten med søk, sortering, paginering
│       ├── skjema.ejs        # felles skjema for «ny» og «rediger»
│       ├── 404.ejs
│       └── feil.ejs
│
├── public/
│   ├── css/style.css         # designspråket: farger, kort, tabell, skjema
│   └── js/kontakter.js       # live-søk, toast og sletting med bekreftelse
│
└── tests/
    ├── api.test.js           # integrasjonstester for API og sider
    └── validators.test.js    # enhetstester for valideringen
```

Bootstrap hentes **fra `node_modules`** og serveres på `/vendor/bootstrap`. Det er ingen
CDN i prosjektet: appen virker uten internett, og ingen tredjepart ser brukerne våre.

---

## 5. API

Alle svar er JSON. Feil har alltid samme form:

```json
{
  "feil": {
    "melding": "Det finnes allerede en kontakt med denne e-postadressen.",
    "felt": { "epost": "Det finnes allerede en kontakt med denne e-postadressen." }
  }
}
```

| Metode   | Sti                  | Beskrivelse                            | Statuskoder                |
| -------- | -------------------- | -------------------------------------- | -------------------------- |
| `GET`    | `/api/kontakter`     | Liste med søk, sortering og paginering | `200`                      |
| `GET`    | `/api/kontakter/:id` | Én kontakt                             | `200`, `404`               |
| `POST`   | `/api/kontakter`     | Opprett ny kontakt                     | `201`, `400`, `409`        |
| `PUT`    | `/api/kontakter/:id` | Oppdater hele kontakten                | `200`, `400`, `404`, `409` |
| `DELETE` | `/api/kontakter/:id` | Slett kontakten                        | `204`, `404`               |

### Parametre for `GET /api/kontakter`

| Parameter   | Standard | Beskrivelse                                                                                      |
| ----------- | -------- | ------------------------------------------------------------------------------------------------ |
| `sok`       | tom      | Fritekst mot navn, e-post og telefon (`ILIKE`, uavhengig av store bokstaver)                     |
| `side`      | `1`      | Hvilken side som skal hentes                                                                     |
| `perSide`   | `10`     | Antall per side, maks `100`                                                                      |
| `sortering` | `navn`   | `navn`, `epost`, `telefon`, `opprettet` eller `endret` – andre verdier faller tilbake til `navn` |
| `retning`   | `asc`    | `asc` eller `desc`                                                                               |

Svarformen er alltid:

```json
{ "rader": [/* … */], "totalt": 12, "side": 1, "perSide": 10 }
```

`totalt` er antall treff **før** paginering, altså det du trenger for å regne ut antall
sider.

### Prøv det med curl

```bash
# Liste med søk
curl 'http://localhost:3000/api/kontakter?sok=ola'

# Opprett
curl -X POST http://localhost:3000/api/kontakter \
  -H 'Content-Type: application/json' \
  -d '{"navn":"Kari Nordmann","epost":"kari@example.no","telefon":"412 34 55"}'

# Oppdater
curl -X PUT http://localhost:3000/api/kontakter/1 \
  -H 'Content-Type: application/json' \
  -d '{"navn":"Kari Nordmann","epost":"kari@example.no","telefon":"900 00 000"}'

# Slett (svarer 204 uten innhold)
curl -X DELETE http://localhost:3000/api/kontakter/1
```

### Sidene

| Metode | Sti            | Beskrivelse                                    |
| ------ | -------------- | ---------------------------------------------- |
| `GET`  | `/`            | Oversikt med søk, sortering og paginering      |
| `GET`  | `/ny`          | Skjema for ny kontakt                          |
| `POST` | `/`            | Lagre ny kontakt (vanlig skjema-POST)          |
| `GET`  | `/:id/rediger` | Skjema for eksisterende kontakt                |
| `POST` | `/:id`         | Lagre endringer                                |
| `POST` | `/:id/slett`   | Slett via skjema (brukes når JavaScript er av) |

---

## 6. Datamodell

Tabellen `kontakter` (se `sql/01-skjema.sql`):

| Kolonne     | Type            | Merknad                               |
| ----------- | --------------- | ------------------------------------- |
| `id`        | `bigserial`     | Primærnøkkel                          |
| `navn`      | `text not null` |                                       |
| `epost`     | `text not null` | Unik indeks på `lower(epost)`         |
| `telefon`   | `text`          | Valgfri                               |
| `notat`     | `text`          | Valgfri                               |
| `opprettet` | `timestamptz`   | `default now()`                       |
| `endret`    | `timestamptz`   | Oppdateres av en trigger ved `UPDATE` |

---

## 7. Miljøvariabler

| Variabel             | Påkrevd | Standard         | Beskrivelse                                    |
| -------------------- | ------- | ---------------- | ---------------------------------------------- |
| `DATABASE_URL`       | ja      | –                | `postgres://bruker:passord@vert:port/database` |
| `NODE_ENV`           | nei     | `development`    | `development`, `test` eller `production`       |
| `PORT`               | nei     | `3000`           | Porten HTTP-serveren lytter på                 |
| `DB_POOL_STOERRELSE` | nei     | `10`             | Maks samtidige databasetilkoblinger            |
| `LOG_LEVEL`          | nei     | `debug` / `info` | pino-nivå                                      |

Appen **nekter å starte** hvis `DATABASE_URL` mangler, med en melding som sier hva du
skal gjøre. Det er med vilje: en app som starter halvveis konfigurert gir bare
vanskeligere feil senere.

---

## 8. God praksis du ser igjen her

Bruk denne listen som en sjekkliste når du leser koden – hvert punkt har en kommentar i
filen som forklarer _hvorfor_.

**Sikkerhet**

- [x] **Alle SQL-spørringer er parameteriserte** (`$1`, `$2`) – ingen strengkonkatennering
      av data (`src/repositories/kontakter.js`)
- [x] **Sorteringskolonne fra hviteliste** – kolonnenavn kan ikke være en parameter, så
      ukjente verdier faller tilbake til standard (`SORTERBARE_KOLONNER`)
- [x] **Ingen hemmeligheter i koden** – alt via miljøvariabler, `.env.example` har bare
      plassholdere, `.env` er i `.gitignore`
- [x] **helmet med Content-Security-Policy** som bare tillater egne filer – ingen
      inline-script, ingen CDN (`src/app.js`)
- [x] **zod-validering på alle skriveoperasjoner**, både i API og skjema; trim + e-post til
      små bokstaver (`src/validators/kontakter.js`)
- [x] **`x-powered-by` er slått av**, og body-parserne har størrelsesgrense
- [x] **Frontend bygger DOM med `textContent`**, aldri `innerHTML` med data fra databasen
      (`public/js/kontakter.js`)

**Data**

- [x] **Tilkoblingspool** (`pg.Pool`), ikke ny `Client` per request (`src/db.js`)
- [x] **`withTransaction()`** for arbeid som må skje atomisk
- [x] **Unik indeks på `lower(epost)`** i databasen, ikke bare sjekk i koden
- [x] **`endret` settes av en trigger**, så den blir riktig uansett hvem som skriver
- [x] **Idempotente SQL-filer** – `npm run db:init` kan kjøres om igjen
- [x] **Poolen lukkes pent** ved shutdown

**Feilhåndtering**

- [x] **Express 5 fanger async-feil automatisk** – derfor ingen `try/catch` rundt hver rute
- [x] **Sentral feilbehandler** logger med pino og skjuler detaljer i produksjon
      (`src/middleware/errors.js`)
- [x] **Riktige statuskoder**: 201 ved oppretting, 204 ved sletting, 400 ved
      valideringsfeil, 404 når noe ikke finnes, 409 ved duplikat e-post
- [x] **`unhandledRejection`-nett** i `src/server.js`, så én glemt `.catch()` ikke tar ned
      hele tjenesten
- [x] **Graceful shutdown** på `SIGTERM`/`SIGINT`: slutt å ta imot forespørsler, lukk
      poolen, avslutt – med tvangslukking etter 10 sekunder

**Grensesnitt**

- [x] **Progressiv forbedring** – sidene virker uten JavaScript; med JavaScript får du
      live-søk med debounce (300 ms), toast og bekreftelsesmodal
- [x] **Server-side validering** med feltvise feilmeldinger og bevarte verdier
- [x] **Tilgjengelighet**: `<label>` på alle felt, `aria-live` på varsler, hopp-til-innhold,
      `aria-current` i menyen, synlig fokusmarkering
- [x] **Norsk bokmål** i all tekst, datoer i `dd.mm.åååå`
- [x] **Egen CSS med variabler** for farger, radius og skygge – ett sted å endre

---

## 9. Øvelser

1. **CSRF-beskyttelse.** Appen har med vilje ingen CSRF-beskyttelse (se kommentaren i
   `src/app.js`). Legg til et engangstoken i skjemaene og avvis POST-er uten gyldig token.
2. **Felt for kategori.** Legg til en `kategori`-kolonne, filtrering i API-et og et
   nedtrekksfelt i skjemaet. Husk migrasjon som tåler å kjøres om igjen.
3. **Eksport til CSV.** Ny rute `GET /api/kontakter.csv` som setter
   `Content-Type: text/csv` og `Content-Disposition: attachment`.
4. **Myk sletting.** Legg til `slettet timestamptz`, filtrer i alle spørringer, og lag en
   «Vis slettede»-side med gjenoppretting.
5. **Innlogging.** Én brukertabell, `express-session` og en innloggingsside – og deretter
   CSRF-oppgaven over, som da blir ekte viktig.
