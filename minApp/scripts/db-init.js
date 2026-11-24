// ---------------------------------------------------------------------------
// «npm run db:init» – oppretter tabellen og legger inn eksempeldata.
//
// Skriptet bruker samme tilkoblingspool som appen (src/db.js), så vi slipper
// psql-kommandolinjeverktøy. Det kan kjøres om og om igjen: SQL-filene er
// skrevet slik at de tåler det (IF NOT EXISTS + ON CONFLICT DO NOTHING).
// ---------------------------------------------------------------------------

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { closePool, pool } from '../src/db.js';

const sqlMappe = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql');
const filer = ['01-skjema.sql', '02-seed.sql'];

/** Viser hvor vi kobler til – uten passordet. */
function beskrivDatabase(url) {
  try {
    const { hostname, port, pathname } = new URL(url);
    return `${hostname}:${port || 5432}${pathname}`;
  } catch {
    return '(kunne ikke lese DATABASE_URL)';
  }
}

console.log(`Kobler til ${beskrivDatabase(config.databaseUrl)} …`);

try {
  for (const fil of filer) {
    const sql = await readFile(path.join(sqlMappe, fil), 'utf8');
    await pool.query(sql); // flere setninger i én spørring er greit uten parametre
    console.log(`  ✔ ${fil}`);
  }

  const { rows } = await pool.query('SELECT count(*)::int AS antall FROM kontakter');
  console.log(`Ferdig. Tabellen «kontakter» har ${rows[0].antall} rader.`);
} catch (feil) {
  console.error('\nKlarte ikke å initialisere databasen:');
  console.error(`  ${feil.message}`);
  console.error(
    '\nSjekk at databasen kjører (docker compose up -d) og at DATABASE_URL i .env er riktig.'
  );
  process.exitCode = 1;
} finally {
  await closePool();
}
