import { Router } from 'express';
import {
  erDuplikatEpost,
  hentKontakt,
  oppdaterKontakt,
  opprettKontakt,
  slettKontakt,
  sokKontakter,
} from '../repositories/kontakter.js';
import { tomKontakt, validerKontakt } from '../validators/kontakter.js';

// ---------------------------------------------------------------------------
// Server-rendrede sider. Disse fungerer uten JavaScript i nettleseren:
// alt som endrer data skjer med et vanlig skjema og en POST.
// ---------------------------------------------------------------------------

export const siderRuter = Router();

const PER_SIDE = 10;

const VARSLER = {
  opprettet: { type: 'suksess', tekst: 'Kontakten ble lagret.' },
  oppdatert: { type: 'suksess', tekst: 'Endringene ble lagret.' },
  slettet: { type: 'suksess', tekst: 'Kontakten ble slettet.' },
};

function lagVarsel(kode) {
  return VARSLER[String(kode ?? '')] ?? null;
}

/** Leser og rydder søke-/sideparametrene fra URL-en. */
function lesParametre(query) {
  const side = Number.parseInt(query.side, 10);
  return {
    sok: typeof query.sok === 'string' ? query.sok : '',
    side: Number.isInteger(side) && side > 0 ? side : 1,
    perSide: PER_SIDE,
    sortering: typeof query.sortering === 'string' ? query.sortering : 'navn',
    retning: typeof query.retning === 'string' ? query.retning : 'asc',
  };
}

/** Leser :id fra URL-en. Ugyldig id gir null, ikke NaN som sprer seg videre. */
function lesId(verdi) {
  const id = Number.parseInt(verdi, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// --- Oversikt --------------------------------------------------------------

siderRuter.get('/', async (req, res) => {
  const parametre = lesParametre(req.query);
  const { rader, totalt, side } = await sokKontakter(parametre);

  res.render('oversikt', {
    aktiv: 'oversikt',
    tittel: 'Kontakter',
    rader,
    totalt,
    side,
    perSide: PER_SIDE,
    antallSider: Math.max(1, Math.ceil(totalt / PER_SIDE)),
    sok: parametre.sok,
    sortering: parametre.sortering,
    retning: parametre.retning,
    varsel: lagVarsel(req.query.varsel),
  });
});

// --- Ny kontakt ------------------------------------------------------------

siderRuter.get('/ny', (req, res) => {
  res.render('skjema', {
    aktiv: 'ny',
    tittel: 'Ny kontakt',
    modus: 'ny',
    handling: '/',
    kontakt: tomKontakt(),
    feilFelt: {},
    feilmelding: null,
  });
});

siderRuter.post('/', async (req, res) => {
  const resultat = validerKontakt(req.body);

  if (!resultat.ok) {
    // 400 + skjemaet på nytt, med verdiene brukeren skrev og feil per felt.
    return res.status(400).render('skjema', {
      aktiv: 'ny',
      tittel: 'Ny kontakt',
      modus: 'ny',
      handling: '/',
      kontakt: { ...tomKontakt(), ...req.body },
      feilFelt: resultat.felt,
      feilmelding: resultat.melding,
    });
  }

  try {
    await opprettKontakt(resultat.data);
  } catch (feil) {
    if (!erDuplikatEpost(feil)) throw feil; // alt annet overlates til feilbehandleren

    // Duplikat e-post er en brukerfeil (409), ikke en krasj: vis skjemaet igjen.
    return res.status(409).render('skjema', {
      aktiv: 'ny',
      tittel: 'Ny kontakt',
      modus: 'ny',
      handling: '/',
      kontakt: { ...tomKontakt(), ...req.body },
      feilFelt: { epost: 'Det finnes allerede en kontakt med denne e-postadressen.' },
      feilmelding: 'E-posten er allerede i bruk.',
    });
  }

  // 303 = «se hit, og bruk GET». Uten redirect ville en refresh lagret
  // kontakten på nytt (klassisk dobbeltinnsending).
  return res.redirect(303, '/?varsel=opprettet');
});

// --- Rediger ---------------------------------------------------------------

siderRuter.get('/:id/rediger', async (req, res) => {
  const id = lesId(req.params.id);
  const kontakt = id === null ? null : await hentKontakt(id);

  if (!kontakt) {
    return res.status(404).render('404', { aktiv: '', tittel: 'Fant ikke kontakten' });
  }

  return res.render('skjema', {
    aktiv: 'oversikt',
    tittel: `Rediger ${kontakt.navn}`,
    modus: 'rediger',
    handling: `/${kontakt.id}`,
    kontakt,
    feilFelt: {},
    feilmelding: null,
  });
});

siderRuter.post('/:id', async (req, res) => {
  const id = lesId(req.params.id);
  if (id === null) {
    return res.status(404).render('404', { aktiv: '', tittel: 'Fant ikke kontakten' });
  }

  const resultat = validerKontakt(req.body);

  if (!resultat.ok) {
    return res.status(400).render('skjema', {
      aktiv: 'oversikt',
      tittel: `Rediger ${req.body.navn ?? 'kontakt'}`,
      modus: 'rediger',
      handling: `/${id}`,
      kontakt: { ...tomKontakt(), ...req.body, id },
      feilFelt: resultat.felt,
      feilmelding: resultat.melding,
    });
  }

  try {
    const oppdatert = await oppdaterKontakt(id, resultat.data);
    if (!oppdatert) {
      return res.status(404).render('404', { aktiv: '', tittel: 'Fant ikke kontakten' });
    }
  } catch (feil) {
    if (!erDuplikatEpost(feil)) throw feil;

    return res.status(409).render('skjema', {
      aktiv: 'oversikt',
      tittel: `Rediger ${req.body.navn ?? 'kontakt'}`,
      modus: 'rediger',
      handling: `/${id}`,
      kontakt: { ...tomKontakt(), ...req.body, id },
      feilFelt: { epost: 'Det finnes allerede en kontakt med denne e-postadressen.' },
      feilmelding: 'E-posten er allerede i bruk.',
    });
  }

  return res.redirect(303, '/?varsel=oppdatert');
});

// --- Slett -----------------------------------------------------------------

// Uten JavaScript sender knappen i tabellen skjemaet rett hit.
// Med JavaScript tar public/js/kontakter.js over, viser en bekreftelsesmodal
// og bruker DELETE /api/kontakter/:id i stedet.
siderRuter.post('/:id/slett', async (req, res) => {
  const id = lesId(req.params.id);
  if (id === null) {
    return res.status(404).render('404', { aktiv: '', tittel: 'Fant ikke kontakten' });
  }

  const slettet = await slettKontakt(id);
  if (!slettet) {
    return res.status(404).render('404', { aktiv: '', tittel: 'Fant ikke kontakten' });
  }

  return res.redirect(303, '/?varsel=slettet');
});
