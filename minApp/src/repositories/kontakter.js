import { query } from '../db.js';

// ---------------------------------------------------------------------------
// ALL SQL i appen bor i denne filen. Rutene skal ikke vite hvordan dataene
// lagres – de ber om «gi meg side 2 med søk på ola» og får JS-objekter tilbake.
// Det gjør det enkelt å teste, og enkelt å bytte database senere.
// ---------------------------------------------------------------------------

/**
 * Kolonnene det er lov å sortere på.
 * HVITELISTE, ikke pynt: et kolonnenavn kan ikke sendes som $1 — det må
 * settes inn i SQL-teksten. Uten en hviteliste kunne en bruker sendt
 * «navn; DROP TABLE kontakter» og fått den teksten rett inn i spørringen.
 * Nå blir ukjente verdier erstattet med standardkolonnen.
 */
export const SORTERBARE_KOLONNER = ['navn', 'epost', 'telefon', 'opprettet', 'endret'];

const STANDARD_SORTERING = 'navn';
const STANDARD_PER_SIDE = 10;
const MAKS_PER_SIDE = 100;

/** PostgreSQL-feilkoden for «brudd på unik indeks». */
const UNIK_BRUDD = '23505';

/** Sjekker om en feil skyldes at e-posten allerede finnes. */
export function erDuplikatEpost(feil) {
  return (
    feil?.code === UNIK_BRUDD &&
    String(feil.constraint ?? '')
      .toLowerCase()
      .includes('epost')
  );
}

function tryggKolonne(kolonne) {
  const noekkel = String(kolonne ?? '').toLowerCase();
  return SORTERBARE_KOLONNER.includes(noekkel) ? noekkel : STANDARD_SORTERING;
}

function tryggRetning(retning) {
  return String(retning ?? '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

/**
 * Gjør om søketeksten til et LIKE-mønster.
 * % og _ er jokertegn i LIKE, så et søk på «100%» må escapes for å bety
 * akkurat «100%» – ellers matcher det alt.
 */
function soekemoenster(sok) {
  const renset = String(sok ?? '')
    .trim()
    .replace(/[\\%_]/g, (tegn) => `\\${tegn}`);
  return `%${renset}%`;
}

function trygtHeltall(verdi, standard, min, maks) {
  const tall = Number.parseInt(verdi, 10);
  if (!Number.isInteger(tall)) return standard;
  return Math.min(maks, Math.max(min, tall));
}

/**
 * Henter én side med kontakter, filtrert på søkeord.
 * Returnerer { rader, totalt } – «totalt» er antall treff FØR paginering,
 * som er det vi trenger for å regne ut antall sider.
 */
export async function sokKontakter({
  sok = '',
  side = 1,
  perSide = STANDARD_PER_SIDE,
  sortering = STANDARD_SORTERING,
  retning = 'asc',
} = {}) {
  const kolonne = tryggKolonne(sortering);
  const rekkefoelge = tryggRetning(retning);
  const tekst = String(sok ?? '').trim();
  const moenster = soekemoenster(tekst);
  const antallPerSide = trygtHeltall(perSide, STANDARD_PER_SIDE, 1, MAKS_PER_SIDE);
  const sideNr = trygtHeltall(side, 1, 1, Number.MAX_SAFE_INTEGER);
  const offset = (sideNr - 1) * antallPerSide;

  // COUNT(*) OVER () gir totalt antall treff i samme spørring, så vi slipper
  // en ekstra rundtur til databasen bare for å vite antall sider.
  // Alle verdier er parametre ($1–$4) – ingen strengkonkatennering av data.
  const { rows } = await query(
    `SELECT id, navn, epost, telefon, notat, opprettet, endret,
            COUNT(*) OVER ()::int AS totalt
       FROM kontakter
      WHERE $1 = ''
         OR navn ILIKE $2
         OR epost ILIKE $2
         OR coalesce(telefon, '') ILIKE $2
      ORDER BY ${kolonne} ${rekkefoelge}, id ASC
      LIMIT $3 OFFSET $4`,
    [tekst, moenster, antallPerSide, offset]
  );

  const totalt = rows.length > 0 ? rows[0].totalt : 0;
  const rader = rows.map(({ totalt: _totalt, ...rad }) => rad);

  return { rader, totalt, side: sideNr, perSide: antallPerSide };
}

/** Henter én kontakt, eller null hvis den ikke finnes. */
export async function hentKontakt(id) {
  const { rows } = await query(
    `SELECT id, navn, epost, telefon, notat, opprettet, endret
       FROM kontakter
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/** Oppretter en kontakt og returnerer raden slik den ble lagret. */
export async function opprettKontakt({ navn, epost, telefon = null, notat = null }) {
  const { rows } = await query(
    `INSERT INTO kontakter (navn, epost, telefon, notat)
          VALUES ($1, $2, $3, $4)
       RETURNING id, navn, epost, telefon, notat, opprettet, endret`,
    [navn, epost, telefon, notat]
  );
  return rows[0];
}

/** Oppdaterer en kontakt. Returnerer null hvis id ikke finnes. */
export async function oppdaterKontakt(id, { navn, epost, telefon = null, notat = null }) {
  const { rows } = await query(
    `UPDATE kontakter
        SET navn = $2, epost = $3, telefon = $4, notat = $5
      WHERE id = $1
    RETURNING id, navn, epost, telefon, notat, opprettet, endret`,
    [id, navn, epost, telefon, notat]
  );
  // «endret» settes av triggeren i databasen, ikke her – se sql/01-skjema.sql.
  return rows[0] ?? null;
}

/** Sletter en kontakt. Returnerer true hvis noe ble slettet. */
export async function slettKontakt(id) {
  const resultat = await query('DELETE FROM kontakter WHERE id = $1', [id]);
  return resultat.rowCount > 0;
}
