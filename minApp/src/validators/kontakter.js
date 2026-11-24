import { z } from 'zod';

// ---------------------------------------------------------------------------
// Validering av brukerinput med zod.
//
// Alt som kommer fra nettleseren er tekst – og kan være hva som helst. Vi
// validerer derfor på serveren (klientvalidering i HTML er bare et hint), og
// gjør det på ETT sted slik at skjema-POST og JSON-API oppfører seg likt.
// ---------------------------------------------------------------------------

const MAKS_NAVN = 100;
const MAKS_EPOST = 200;
const MAKS_TELEFON = 20;
const MAKS_NOTAT = 1000;

/**
 * Valgfritt tekstfelt.
 * Tom streng fra et HTML-skjema betyr «ikke fylt ut», ikke «verdien er ''».
 * Vi gjør den om til null så databasen får NULL og ikke en tom streng.
 * .nullable() godtar null, .optional() godtar at feltet mangler helt (JSON).
 */
function valgfriTekst(maks, feilmelding, moenster, moensterfeil) {
  let tekst = z.string().trim().max(maks, feilmelding);
  if (moenster) tekst = tekst.regex(moenster, moensterfeil);
  return z.preprocess(
    (verdi) => (typeof verdi === 'string' && verdi.trim() === '' ? null : verdi),
    tekst.nullable().optional()
  );
}

export const kontaktSkjema = z.object({
  navn: z
    .string('Navn er påkrevd')
    .trim()
    .min(2, 'Navnet må ha minst 2 tegn')
    .max(MAKS_NAVN, `Navnet kan ha maks ${MAKS_NAVN} tegn`),

  // trim + toLowerCase: « Ola@Example.NO » lagres som «ola@example.no».
  // Det er samme normalisering som den unike indeksen på lower(epost) bruker.
  epost: z
    .string('E-post er påkrevd')
    .trim()
    .toLowerCase()
    .max(MAKS_EPOST, `E-postadressen kan ha maks ${MAKS_EPOST} tegn`)
    .pipe(z.email('Skriv en gyldig e-postadresse, for eksempel ola@example.no')),

  telefon: valgfriTekst(
    MAKS_TELEFON,
    `Telefonnummeret kan ha maks ${MAKS_TELEFON} tegn`,
    /^[0-9+()\s.-]{4,20}$/,
    'Bruk bare tall, mellomrom og tegnene + ( ) . -'
  ),

  notat: valgfriTekst(MAKS_NOTAT, `Notatet kan ha maks ${MAKS_NOTAT} tegn`),
});

/** Feltene skjemaet forventer, med tomme verdier. Brukes av «ny kontakt». */
export function tomKontakt() {
  return { navn: '', epost: '', telefon: '', notat: '' };
}

/**
 * Validerer input fra skjema eller API.
 * Returnerer alltid et objekt, aldri en exception – da blir kallstedet enkelt:
 *
 *   const resultat = validerKontakt(req.body)
 *   if (!resultat.ok) { ...vis resultat.felt... }
 *
 * Ved feil får vi ÉN melding per felt (den første), som er det brukeren
 * trenger å se – ikke fem varianter av samme problem.
 */
export function validerKontakt(input) {
  const resultat = kontaktSkjema.safeParse(input ?? {});

  if (resultat.success) {
    return {
      ok: true,
      data: {
        navn: resultat.data.navn,
        epost: resultat.data.epost,
        telefon: resultat.data.telefon || null,
        notat: resultat.data.notat || null,
      },
    };
  }

  const felt = {};
  for (const problem of resultat.error.issues) {
    const navn = problem.path[0] ?? 'skjema';
    if (!felt[navn]) felt[navn] = problem.message;
  }

  return {
    ok: false,
    felt,
    melding: 'Sjekk feltene som er markert med rødt.',
  };
}
