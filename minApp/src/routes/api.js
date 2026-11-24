import { Router } from 'express';
import {
  hentKontakt,
  oppdaterKontakt,
  opprettKontakt,
  slettKontakt,
  sokKontakter,
} from '../repositories/kontakter.js';
import { validerKontakt } from '../validators/kontakter.js';

// ---------------------------------------------------------------------------
// JSON-API under /api/kontakter.
//
// Dette er det samme API-et som frontend-koden bruker for live-søk og sletting,
// og som du kan teste med curl:
//
//   curl 'http://localhost:3000/api/kontakter?sok=ola'
//
// Feilsvar har alltid samme form, slik at klienten kan behandle dem likt:
//   { "feil": { "melding": "...", "felt": { "epost": "..." } } }
//
// Merk: vi trenger ingen try/catch rundt de asynkrone handlerne. Express 5
// sender feilen videre til feilbehandleren automatisk. Duplikat e-post blir
// til 409 der, fordi den sentrale feilbehandleren kjenner igjen
// PostgreSQL-koden 23505.
// ---------------------------------------------------------------------------

export const apiRuter = Router();

function lesId(verdi) {
  const id = Number.parseInt(verdi, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function feil404(melding = 'Fant ingen kontakt med denne id-en.') {
  return { feil: { melding, felt: {} } };
}

/** GET /api/kontakter?sok=&side=&perSide=&sortering=&retning= */
apiRuter.get('/', async (req, res) => {
  const resultat = await sokKontakter({
    sok: typeof req.query.sok === 'string' ? req.query.sok : '',
    side: req.query.side,
    perSide: req.query.perSide,
    sortering: req.query.sortering,
    retning: req.query.retning,
  });

  // Formen på svaret er dokumentert i README: { rader, totalt, side, perSide }.
  res.json(resultat);
});

/** GET /api/kontakter/:id */
apiRuter.get('/:id', async (req, res) => {
  // Ugyldig id gir 404 og ikke 400: ressursen finnes ikke uansett hva
  // id-en måtte bety, og da er «ikke funnet» det ærlige svaret.
  const id = lesId(req.params.id);
  if (id === null) return res.status(404).json(feil404('Ugyldig id.'));

  const kontakt = await hentKontakt(id);
  if (!kontakt) return res.status(404).json(feil404());

  return res.json(kontakt);
});

/** POST /api/kontakter – opprett */
apiRuter.post('/', async (req, res) => {
  const validert = validerKontakt(req.body);
  if (!validert.ok) {
    return res.status(400).json({ feil: { melding: validert.melding, felt: validert.felt } });
  }

  const kontakt = await opprettKontakt(validert.data);
  // 201 Created + Location til den nye ressursen. Det er slik REST-API-er
  // forteller klienten hvor det nye objektet bor.
  return res.status(201).location(`/api/kontakter/${kontakt.id}`).json(kontakt);
});

/** PUT /api/kontakter/:id – full oppdatering */
apiRuter.put('/:id', async (req, res) => {
  const id = lesId(req.params.id);
  if (id === null) return res.status(404).json(feil404('Ugyldig id.'));

  const validert = validerKontakt(req.body);
  if (!validert.ok) {
    return res.status(400).json({ feil: { melding: validert.melding, felt: validert.felt } });
  }

  const kontakt = await oppdaterKontakt(id, validert.data);
  if (!kontakt) return res.status(404).json(feil404());

  return res.json(kontakt);
});

/** DELETE /api/kontakter/:id */
apiRuter.delete('/:id', async (req, res) => {
  const id = lesId(req.params.id);
  if (id === null) return res.status(404).json(feil404('Ugyldig id.'));

  const slettet = await slettKontakt(id);
  if (!slettet) return res.status(404).json(feil404());

  // 204 No Content: slettingen lyktes, og det er ingenting å sende tilbake.
  return res.status(204).end();
});
