import { app } from './app.js';
import { config } from './config.js';
import { closePool } from './db.js';
import { logger } from './logger.js';

// ---------------------------------------------------------------------------
// Oppstart og avslutning. All oppsett av Express ligger i app.js – denne filen
// gjør bare tre ting: starter HTTP-serveren, håndterer feil som ellers ville
// tatt ned prosessen, og avslutter pent når vi blir bedt om det.
// ---------------------------------------------------------------------------

const server = app.listen(config.port, () => {
  logger.info(
    `Kontakter lytter på http://localhost:${config.port} (${config.nodeEnv}) – avbryt med Ctrl+C`
  );
});

/**
 * «Graceful shutdown»: når Docker eller systemd stopper appen, får vi SIGTERM.
 * Da skal vi ikke bare dø – vi skal slutte å ta imot nye forespørsler, la
 * pågående arbeid bli ferdig og lukke databasetilkoblingene pent. Ellers kan
 * brukere få brutte svar, og databasen sitter igjen med halvferdige
 * transaksjoner.
 */
let avslutter = false;

async function avslutt(signal) {
  if (avslutter) return;
  avslutter = true;

  logger.info(`Fikk ${signal} – avslutter pent`);

  // Hvis noe henger, gir vi opp etter 10 sekunder i stedet for å bli stående.
  const tvang = setTimeout(() => {
    logger.error('Klarte ikke å avslutte pent innen 10 sekunder – avbryter hardt');
    process.exit(1);
  }, 10_000);
  tvang.unref();

  server.close(async () => {
    let kode = 0;
    try {
      await closePool(); // lukk databasetilkoblingene
      logger.info('HTTP-server og databasepool er lukket');
    } catch (feil) {
      logger.error({ feil }, 'Feil under lukking av databasepoolen');
      kode = 1;
    }

    // pino leverer loggen via en egen worker-tråd. Uten denne korte pausen kan
    // de siste linjene gå tapt når prosessen avsluttes med en gang.
    setTimeout(() => process.exit(kode), 100);
  });

  // Server.close() venter på pågående forespørsler, men keep-alive-forbindelser
  // som ikke gjør noe kan holde den åpen lenge. Lukk dem med en gang.
  server.closeIdleConnections();
}

process.on('SIGTERM', () => avslutt('SIGTERM'));
process.on('SIGINT', () => avslutt('SIGINT'));

/**
 * Siste skanse. En glemt `.catch()` gir en ubehandlet promise-avvisning, og
 * Node avslutter prosessen med mindre vi lytter her. Vi logger den i stedet –
 * og lar appen leve, slik at én feil i én forespørsel ikke tar ned hele
 * tjenesten for alle andre.
 */
process.on('unhandledRejection', (grunn) => {
  logger.error({ grunn }, 'Ubehandlet promise-avvisning – dette er en bug som bør fikses');
});

process.on('uncaughtException', (feil) => {
  // Her er tilstanden ukjent, så vi logger og avslutter kontrollert.
  logger.fatal({ feil }, 'Uhåndtert exception – avslutter');
  avslutt('uncaughtException');
});
