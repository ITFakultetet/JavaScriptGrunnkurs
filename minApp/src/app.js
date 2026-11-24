import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { logger } from './logger.js';
import { feilbehandler, ikkeFunnet } from './middleware/errors.js';
import { apiRuter } from './routes/api.js';
import { siderRuter } from './routes/sider.js';

const her = path.dirname(fileURLToPath(import.meta.url));
const rot = path.join(her, '..');

export const app = express();

// --- Trygghet og logging ---------------------------------------------------

app.disable('x-powered-by'); // ikke røp hvilken server vi bruker

// Bak en reverse proxy (nginx, Docker) må Express få vite det, ellers blir
// alle besøkende sett på som proxyens IP-adresse.
if (config.erProduksjon) app.set('trust proxy', 1);

// helmet setter en haug med sikkerhetsheadere. Den viktigste er
// Content-Security-Policy: den forteller nettleseren hvilke kilder den har lov
// til å hente kode og stilark fra. Vi tillater BARE våre egne filer – ingen
// CDN, ingen inline <script>. Da er en XSS-injeksjon nesten ubrukelig for en
// angriper, fordi nettleseren nekter å kjøre skriptet.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        // upgrade-insecure-requests gir bare mening bak https. Lokalt kjører vi
        // http, så da slår vi den av for å slippe rarheter i nettleseren.
        upgradeInsecureRequests: config.erProduksjon ? [] : null,
      },
    },
  })
);

// HTTP-logg med pino. Statiske filer (CSS, JS, Bootstrap) logges ikke – de
// støyet bare, og de sier ingenting om hva brukeren gjorde.
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => /^\/(css|js|vendor|favicon\.ico)/.test(req.url),
    },
  })
);

// --- Synlig for nettleseren -------------------------------------------------

// Egen CSS/JS. express.static hindrer path traversal, setter ETag og riktig
// Content-Type automatisk.
app.use(express.static(path.join(rot, 'public')));

// Bootstrap serveres FRA node_modules i stedet for fra en CDN. Da virker appen
// uten internett, det er ingen tredjepart som kan se brukerne våre, og
// versjonen kan ikke plutselig endre seg uten at vi oppgraderer.
app.use('/vendor/bootstrap', express.static(path.join(rot, 'node_modules/bootstrap/dist')));

// --- Skjema og JSON --------------------------------------------------------

// extended: false er nok her (ingen innebygde objekter i skjemaene) og gir
// mindre å angripe. limit beskytter mot at noen poster 100 MB tekst.
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

// CSRF er bevisst IKKE med i dette eksempelet, og det er verdt å vite hvorfor:
// uten beskyttelse kan en ond nettside få en innlogget brukers nettleser til å
// sende inn skjemaet vårt uten at brukeren vet det. Appen her har ingen
// innlogging og ingen hemmelige data, så det er lite å vinne for en angriper –
// og vi vil holde eksempelet lite. I en ekte app med innlogging er dette
// ØVELSE 1: legg til et engangstoken i en skjult input, lagre det i økten og
// avvis POST-er der tokenet mangler eller er feil (jf. pakken «csrf»).

// --- Maler -----------------------------------------------------------------

app.set('view engine', 'ejs');
app.set('views', path.join(her, 'views'));
if (!config.erProduksjon) app.set('view cache', false); // se endringer med en gang

const datoformat = new Intl.DateTimeFormat('nb-NO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Gjør om en dato til norsk format (24.11.2026). Brukes i alle malene. */
app.locals.formaterDato = (verdi) => {
  if (!verdi) return '–';
  const dato = verdi instanceof Date ? verdi : new Date(verdi);
  return Number.isNaN(dato.getTime()) ? '–' : datoformat.format(dato);
};

app.locals.appNavn = 'Kontakter';
app.locals.aktiv = '';

// --- Ruter -----------------------------------------------------------------

app.use('/api/kontakter', apiRuter);
app.use('/', siderRuter);

// Rekkefølgen til slutt betyr noe: 404 først når INGEN rute over har svart,
// og feilbehandleren helt til slutt.
app.use(ikkeFunnet);
app.use(feilbehandler);

export default app;
