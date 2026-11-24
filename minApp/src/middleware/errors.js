import { config } from '../config.js';
import { logger } from '../logger.js';
import { erDuplikatEpost } from '../repositories/kontakter.js';

// ---------------------------------------------------------------------------
// Feilhåndtering på ett sted.
//
// Express 5 fanger automatisk feil i async-ruter: kaster du en feil (eller
// returnerer en avvist promise) i en async handler, kaller Express next(feil)
// for deg. Det er nytt i Express 5 – i Express 4 måtte alt pakkes i try/catch.
// Til slutt lander alt her, i den sentrale feilbehandleren.
// ---------------------------------------------------------------------------

/** Svarer kunden med JSON eller HTML? API-et skal aldri få en HTML-feilside. */
function vilHaJson(req) {
  return req.originalUrl.startsWith('/api/');
}

/**
 * Gjør en teknisk feil om til en melding brukeren kan forstå.
 * Body-parseren i Express kaster egne feil for ugyldig JSON (400) og for stor
 * body (413) – de er det lurt å oversette, ellers får brukeren «Ukjent feil».
 */
function forklar(feil, status) {
  if (status === 413) return 'Forespørselen er for stor.';
  if (feil?.type === 'entity.parse.failed') return 'Ugyldig JSON i forespørselen.';
  return feil?.message ?? feil?.melding ?? 'Ukjent feil.';
}

/** 404: ingen rute matchet forespørselen. */
export function ikkeFunnet(req, res) {
  if (vilHaJson(req)) {
    return res.status(404).json({ feil: { melding: 'Fant ikke ressursen.', felt: {} } });
  }
  return res.status(404).render('404', { aktiv: '', tittel: 'Siden finnes ikke' });
}

/**
 * Sentral feilbehandler. Signatur med fire argumenter er det som gjør at
 * Express gjenkjenner den som en feilbehandler – derfor må «neste» stå der,
 * selv om vi ikke bruker den.
 */
export function feilbehandler(feil, req, res, neste) {
  // Unik e-post er en brukerfeil, ikke en systemfeil: 409 Conflict.
  if (erDuplikatEpost(feil)) {
    const melding = 'Det finnes allerede en kontakt med denne e-postadressen.';
    if (vilHaJson(req)) {
      return res.status(409).json({ feil: { melding, felt: { epost: melding } } });
    }
    return res.status(409).render('feil', {
      aktiv: '',
      tittel: 'E-posten er i bruk',
      status: 409,
      melding,
    });
  }

  const status = Number.isInteger(feil.status) && feil.status >= 400 ? feil.status : 500;

  // Vi logger hele feilen med stabelspor på serveren ...
  logger.error({ feil, status, metode: req.method, url: req.originalUrl }, 'Uhåndtert feil');

  // ... men detaljene blir ALDRI sendt til brukeren i produksjon. Et
  // stabelspor eller et SQL-sitat i nettleseren er gratis informasjon til en
  // angriper, så i produksjon får 5xx-svar en generisk melding. Under
  // utvikling vil vi derimot se hva som faktisk gikk galt.
  const skjul = status >= 500 && config.erProduksjon;
  const melding = skjul ? 'Noe gikk galt på serveren. Prøv igjen om litt.' : forklar(feil, status);

  if (res.headersSent) {
    // Svaret er allerede på vei ut – da kan vi bare avslutte pent.
    return neste(feil);
  }

  if (vilHaJson(req)) {
    return res.status(status).json({ feil: { melding, felt: {} } });
  }

  return res.status(status).render('feil', {
    aktiv: '',
    tittel: 'Noe gikk galt',
    status,
    melding,
    detaljer: status >= 500 ? null : (feil.stack ?? null),
  });
}
