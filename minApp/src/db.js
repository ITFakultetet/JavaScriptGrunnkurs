import pg from 'pg';
import { config } from './config.js';
import { logger } from './logger.js';

// BIGSERIAL er 64-bits heltall (int8), og node-postgres gir int8 som STRENG for
// ikke å miste presisjon på store tall. Her er det bare id-er og antall, og vi
// vil ha tall i JSON-svaret («id»: 7, ikke «id»: «7»), så vi ber pg gjøre om.
pg.types.setTypeParser(pg.types.builtins.INT8, (verdi) => Number.parseInt(verdi, 10));

// Pool = et gjenbrukbart sett med tilkoblinger. Å lage en ny Client per
// request er en klassisk feil: hver tilkobling tar 20–50 ms å etablere, og
// databasen har et hardt tak på antall samtidige tilkoblinger. Poolen holder
// noen få tilkoblinger åpne og låner dem ut etter tur.
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolStoerrelse,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Uten denne lytteren krasjer hele prosessen når en ledig tilkobling mister
// forbindelsen (f.eks. ved restart av databasen). Vi logger og lar poolen
// ordne opp selv.
pool.on('error', (feil) => {
  logger.error({ feil }, 'Feil på en ledig tilkobling i poolen');
});

/**
 * Kort vei til en parameterisert spørring.
 * SIKKERHET: alltid $1, $2 … og verdiene i andre argument. Da sendes SQL og
 * data separat til databasen, og det er umulig å injisere SQL gjennom input.
 */
export async function query(tekst, parametre = []) {
  const start = Date.now();
  const resultat = await pool.query(tekst, parametre);
  logger.debug(
    { ms: Date.now() - start, rader: resultat.rowCount, sql: tekst.split('\n')[0] },
    'SQL kjørt'
  );
  return resultat;
}

/**
 * Kjører flere spørringer som én atomisk enhet: alt eller ingenting.
 * Nyttig når to tabeller må oppdateres sammen – går noe galt, ruller vi
 * tilbake og databasen er urørt.
 */
export async function withTransaction(arbeid) {
  const klient = await pool.connect();
  try {
    await klient.query('BEGIN');
    const resultat = await arbeid(klient);
    await klient.query('COMMIT');
    return resultat;
  } catch (feil) {
    await klient.query('ROLLBACK');
    throw feil;
  } finally {
    // Må alltid tilbake til poolen – ellers lekker vi tilkoblinger og appen
    // stopper når poolen er tom.
    klient.release();
  }
}

/** Lukker poolen pent. Kalles ved shutdown, etter at HTTP-serveren er stengt. */
export async function closePool() {
  await pool.end();
}
