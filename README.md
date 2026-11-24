# JavaScript Grunnkurs – kodeeksempler

Dette repoet inneholder kodeeksemplene som brukes i kurset **JavaScript Grunnkurs** hos
[ITFakultetet](https://itfakultetet.no) — se kurset på
[kurs.itfakultetet.no](https://kurs.itfakultetet.no).

## Innhold

| Mappe | Hva det er |
| --- | --- |
| [`minApp/`](minApp/) | **Eksempelappen** — en komplett webapp som henter og lagrer data i PostgreSQL. Express 5, EJS, Bootstrap og `pg`, bygget som et referanseeksempel på god praksis. Egen README med oppskrift. |
| [`eksempler/`](eksempler/) | Små, frittstående eksempler som følger emnene i kurset: array-metoder, closures, `this`/`bind`, prototype, JSON, dato og tid, regulære uttrykk, spread/reduce, sortering, fil-API-er i nettleseren, en CSS-selektor-demo og Battleship-spillet. |

## Kom i gang med eksempelappen

```bash
cd minApp
cp .env.example .env      # fyll inn databasepassord
docker compose up -d      # starter PostgreSQL 17 lokalt
npm install
npm run db:init           # oppretter tabell og legger inn eksempeldata
npm run dev               # http://localhost:3000
```

Full oppskrift, API-dokumentasjon og gjennomgang av god praksis finnes i
[`minApp/README.md`](minApp/README.md).

## Kjøre eksemplene

Filene i `eksempler/` er vanlige JavaScript-filer som kjøres med Node:

```bash
cd eksempler
node arrays.js
```

HTML-filene (`test.html`, `video.html`, `battleship/`, `css-selector/`) åpnes direkte i
nettleseren.

## Krav

- Node.js 22 eller nyere (`node -v`)
- Docker (for å kjøre PostgreSQL lokalt) — eller en PostgreSQL-server du har tilgang til
- En editor, for eksempel Visual Studio Code

## Lisens

Kodeeksemplene er laget for undervisning og kan brukes fritt i egen opplæring.
