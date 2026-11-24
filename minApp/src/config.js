import dotenv from 'dotenv';

// Leser .env inn i process.env. Verdier som allerede finnes i miljøet
// (satt av Docker, systemd eller testkjøringen) vinner – dotenv overskriver
// aldri noe som er satt fra før. Det er nettopp det vi vil: miljøet skal
// kunne overstyre filen.
// quiet: dotenv skal ikke skrive «injected env»-melding ved hver oppstart.
dotenv.config({ quiet: true });

/**
 * Henter en miljøvariabel som MÅ finnes.
 * Feiler tidlig og tydelig – mye bedre enn en kryptisk feil senere når
 * databasen ikke svarer fordi URL-en var tom.
 */
function paakrevd(navn) {
  const verdi = process.env[navn];
  if (typeof verdi !== 'string' || verdi.trim() === '') {
    throw new Error(
      `Mangler miljøvariabelen ${navn}.\n` +
        'Kopier .env.example til .env og fyll inn verdien (se README.md).'
    );
  }
  return verdi.trim();
}

/** Henter et heltall fra miljøet, med en fornuftig standardverdi. */
function heltall(navn, standard) {
  const raa = process.env[navn];
  if (raa === undefined || raa.trim() === '') return standard;
  const tall = Number.parseInt(raa, 10);
  if (!Number.isInteger(tall) || tall <= 0) {
    throw new Error(`Miljøvariabelen ${navn} må være et positivt heltall, fikk «${raa}».`);
  }
  return tall;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const config = {
  nodeEnv,
  erProduksjon: nodeEnv === 'production',
  erTest: nodeEnv === 'test',
  port: heltall('PORT', 3000),

  // Hele tilkoblingsoppsettet ligger i én URL, slik at det er én enkelt
  // hemmelighet å rotere – og ingen passord i kildekoden.
  databaseUrl: paakrevd('DATABASE_URL'),

  // Maks antall samtidige tilkoblinger i poolen. Flere enn databasen har
  // plass til gir bare kø, så 10 er rikelig for denne appen.
  dbPoolStoerrelse: heltall('DB_POOL_STOERRELSE', 10),

  // «debug» i utvikling gir nyttige detaljer, «info» i produksjon holder
  // loggen lesbar. «warn» under test: vi vil se feil, ikke hver request.
  logNiva:
    process.env.LOG_LEVEL ??
    (nodeEnv === 'production' ? 'info' : nodeEnv === 'test' ? 'warn' : 'debug'),
};

export default config;
