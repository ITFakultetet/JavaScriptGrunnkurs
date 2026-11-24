import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { app } from '../src/app.js';
import { closePool, pool } from '../src/db.js';

// ---------------------------------------------------------------------------
// Integrasjonstester for JSON-API-et.
//
// Testene kjører mot en EKTE PostgreSQL-database (den i .env) og bruker
// supertest, som sender HTTP-forespørsler til appen uten å starte en server på
// en port. Det gjør testene raske og lar oss bruke node:test, som er innebygd
// i Node – ingen testrammeverk å installere.
//
// VIKTIG: before() tømmer tabellen kontakter og legger inn seed-data på nytt,
// slik at testene er forutsigbare. Kjør derfor aldri npm test mot en database
// du er redd for.
// ---------------------------------------------------------------------------

const sqlMappe = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql');
const SEED_ANTALL = 12;

let baseline = 0;

/** Unik e-post per test, så testene ikke forstyrrer hverandre. */
function unikEpost(prefiks = 'test') {
  return `${prefiks}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.no`;
}

before(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Testene tømmer kontakter-tabellen og må aldri kjøres mot produksjonsdata.');
  }

  // Samme SQL-filer som «npm run db:init» bruker – testene setter altså opp
  // skjemaet selv, og trenger ikke at du har kjørt db:init først.
  await pool.query(await readFile(path.join(sqlMappe, '01-skjema.sql'), 'utf8'));
  await pool.query('TRUNCATE kontakter RESTART IDENTITY');
  await pool.query(await readFile(path.join(sqlMappe, '02-seed.sql'), 'utf8'));

  const { rows } = await pool.query('SELECT count(*)::int AS antall FROM kontakter');
  baseline = rows[0].antall;
  assert.equal(baseline, SEED_ANTALL, 'seed-filen skal gi 12 kontakter');
});

after(async () => {
  // Lukk poolen, ellers blir testprosessen hengende.
  await closePool();
});

describe('GET /api/kontakter', () => {
  it('returnerer første side med standard paginering', async () => {
    const svar = await request(app).get('/api/kontakter').expect(200);

    assert.equal(svar.body.totalt, baseline);
    assert.equal(svar.body.side, 1);
    assert.equal(svar.body.perSide, 10);
    assert.equal(svar.body.rader.length, 10);
    assert.ok(svar.body.rader[0].id > 0);
    assert.ok(svar.body.rader[0].navn);
  });

  it('gir neste side med de resterende radene', async () => {
    const svar = await request(app).get('/api/kontakter?side=2').expect(200);

    assert.equal(svar.body.side, 2);
    assert.equal(svar.body.rader.length, baseline - 10);
  });

  it('filtrerer på søkeord i navn', async () => {
    const svar = await request(app).get('/api/kontakter?sok=kari').expect(200);

    assert.ok(svar.body.totalt >= 1);
    for (const rad of svar.body.rader) {
      const treffflate = `${rad.navn} ${rad.epost} ${rad.telefon ?? ''}`.toLowerCase();
      assert.ok(treffflate.includes('kari'), `«${rad.navn}» skulle matchet «kari»`);
    }
  });

  it('filtrerer på søkeord i e-post (uavhengig av store bokstaver)', async () => {
    const svar = await request(app).get('/api/kontakter?sok=EXAMPLE.NO&perSide=100').expect(200);

    assert.equal(svar.body.totalt >= SEED_ANTALL, true);
  });

  it('gir tom liste og totalt 0 når ingenting matcher', async () => {
    const svar = await request(app)
      .get('/api/kontakter?sok=finnes-ikke-i-det-hele-tatt')
      .expect(200);

    assert.equal(svar.body.totalt, 0);
    assert.deepEqual(svar.body.rader, []);
  });

  it('sorterer synkende når retning=desc', async () => {
    const svar = await request(app)
      .get('/api/kontakter?sortering=epost&retning=desc&perSide=100')
      .expect(200);

    const eposter = svar.body.rader.map((rad) => rad.epost);
    const sortert = [...eposter].sort((a, b) => b.localeCompare(a));
    assert.deepEqual(eposter, sortert);
  });

  it('ignorerer et søkeforsøk på SQL-injeksjon i sorteringsparameteren', async () => {
    // Kolonnenavn kan ikke parameteriseres, så vi bruker en hviteliste.
    // Her skal farlig input bare falle tilbake til standard sortering.
    const svar = await request(app)
      .get('/api/kontakter?sortering=' + encodeURIComponent('navn; DROP TABLE kontakter'))
      .expect(200);

    assert.equal(svar.body.totalt, baseline);

    const sjekk = await pool.query('SELECT count(*)::int AS antall FROM kontakter');
    assert.equal(sjekk.rows[0].antall, baseline, 'tabellen skal fortsatt være intakt');
  });

  it('begrenser perSide slik at ingen kan hente alle radene i én spørring', async () => {
    const svar = await request(app).get('/api/kontakter?perSide=99999').expect(200);
    assert.ok(svar.body.perSide <= 100);
  });
});

describe('GET /api/kontakter/:id', () => {
  it('henter én kontakt', async () => {
    const liste = await request(app).get('/api/kontakter').expect(200);
    const id = liste.body.rader[0].id;

    const svar = await request(app).get(`/api/kontakter/${id}`).expect(200);
    assert.equal(svar.body.id, id);
  });

  it('gir 404 med feilobjekt når id ikke finnes', async () => {
    const svar = await request(app).get('/api/kontakter/99999999').expect(404);

    assert.equal(typeof svar.body.feil.melding, 'string');
    assert.deepEqual(svar.body.feil.felt, {});
  });

  it('gir 404 for en id som ikke er et tall', async () => {
    await request(app).get('/api/kontakter/abc').expect(404);
  });
});

describe('POST /api/kontakter', () => {
  it('oppretter en kontakt og svarer 201 med Location', async () => {
    const epost = unikEpost('ny');

    const svar = await request(app)
      .post('/api/kontakter')
      .send({ navn: 'Test Person', epost, telefon: '400 00 000', notat: 'Laget i test' })
      .expect(201);

    assert.equal(svar.body.navn, 'Test Person');
    assert.equal(svar.body.epost, epost);
    assert.equal(svar.headers.location, `/api/kontakter/${svar.body.id}`);
    assert.ok(svar.body.opprettet);

    // Rydd opp etter testen.
    await request(app).delete(`/api/kontakter/${svar.body.id}`).expect(204);
  });

  it('normaliserer e-post til små bokstaver og trimmer navnet', async () => {
    const epost = unikEpost('store').toUpperCase();

    const svar = await request(app)
      .post('/api/kontakter')
      .send({ navn: '  Kari Med Mellomrom  ', epost })
      .expect(201);

    assert.equal(svar.body.epost, epost.toLowerCase());
    assert.equal(svar.body.navn, 'Kari Med Mellomrom');

    await request(app).delete(`/api/kontakter/${svar.body.id}`).expect(204);
  });

  it('lagrer tomme valgfrie felt som null', async () => {
    const svar = await request(app)
      .post('/api/kontakter')
      .send({ navn: 'Uten Telefon', epost: unikEpost('tom'), telefon: '', notat: '' })
      .expect(201);

    assert.equal(svar.body.telefon, null);
    assert.equal(svar.body.notat, null);

    await request(app).delete(`/api/kontakter/${svar.body.id}`).expect(204);
  });

  it('avviser ugyldig input med 400 og feil per felt', async () => {
    const svar = await request(app)
      .post('/api/kontakter')
      .send({ navn: 'K', epost: 'ikke-en-epost', telefon: 'ring meg' })
      .expect(400);

    assert.match(svar.body.feil.melding, /markert/i);
    assert.ok(svar.body.feil.felt.navn);
    assert.ok(svar.body.feil.felt.epost);
    assert.ok(svar.body.feil.felt.telefon);
  });

  it('gir 409 når e-posten allerede finnes (uansett store/små bokstaver)', async () => {
    const liste = await request(app).get('/api/kontakter').expect(200);
    const eksisterende = liste.body.rader[0].epost;

    const svar = await request(app)
      .post('/api/kontakter')
      .send({ navn: 'Duplikat', epost: eksisterende.toUpperCase() })
      .expect(409);

    assert.match(svar.body.feil.melding, /allerede/i);
    assert.ok(svar.body.feil.felt.epost);
  });
});

describe('PUT /api/kontakter/:id', () => {
  it('oppdaterer en kontakt og setter «endret» nyere enn «opprettet»', async () => {
    const opprettet = await request(app)
      .post('/api/kontakter')
      .send({ navn: 'Før Endring', epost: unikEpost('put') })
      .expect(201);

    // Triggeren i databasen setter «endret» ved UPDATE. Vi sover bittelitt
    // for å være sikker på at tidsstemplet blir forskjellig.
    await new Promise((løs) => setTimeout(løs, 20));

    const svar = await request(app)
      .put(`/api/kontakter/${opprettet.body.id}`)
      .send({ navn: 'Etter Endring', epost: opprettet.body.epost, telefon: '911 11 111' })
      .expect(200);

    assert.equal(svar.body.navn, 'Etter Endring');
    assert.equal(svar.body.telefon, '911 11 111');
    assert.ok(new Date(svar.body.endret) >= new Date(opprettet.body.endret));

    await request(app).delete(`/api/kontakter/${opprettet.body.id}`).expect(204);
  });

  it('gir 400 ved ugyldig input', async () => {
    const liste = await request(app).get('/api/kontakter').expect(200);

    const svar = await request(app)
      .put(`/api/kontakter/${liste.body.rader[0].id}`)
      .send({ navn: '', epost: '' })
      .expect(400);

    assert.ok(svar.body.feil.felt.navn);
  });

  it('gir 404 for en kontakt som ikke finnes', async () => {
    await request(app)
      .put('/api/kontakter/99999999')
      .send({ navn: 'Finnes Ikke', epost: unikEpost('ingen') })
      .expect(404);
  });
});

describe('DELETE /api/kontakter/:id', () => {
  it('sletter kontakten og svarer 204 uten innhold', async () => {
    const opprettet = await request(app)
      .post('/api/kontakter')
      .send({ navn: 'Skal Slettes', epost: unikEpost('slett') })
      .expect(201);

    const svar = await request(app).delete(`/api/kontakter/${opprettet.body.id}`).expect(204);
    assert.equal(svar.text, '');

    await request(app).get(`/api/kontakter/${opprettet.body.id}`).expect(404);
  });

  it('gir 404 når kontakten allerede er borte', async () => {
    await request(app).delete('/api/kontakter/99999999').expect(404);
  });
});

describe('Server-rendrede sider', () => {
  it('viser oversikten med kontakter fra databasen', async () => {
    const svar = await request(app).get('/').expect(200);

    assert.match(svar.headers['content-type'], /text\/html/);
    assert.match(svar.text, /Kontakter/);
    assert.match(svar.text, /Kari Nordmann/);
  });

  it('viser skjemaet for ny kontakt', async () => {
    const svar = await request(app).get('/ny').expect(200);
    assert.match(svar.text, /Ny kontakt/);
    assert.match(svar.text, /name="epost"/);
  });

  it('viser feltfeil og beholder verdiene ved server-side validering', async () => {
    const svar = await request(app)
      .post('/')
      .type('form')
      .send({ navn: 'Beholdt Navn', epost: 'feil-epost', telefon: '', notat: 'Mitt notat' })
      .expect(400);

    assert.match(svar.text, /Beholdt Navn/); // verdien er bevart
    assert.match(svar.text, /Mitt notat/);
    assert.match(svar.text, /gyldig e-postadresse/i);
  });

  it('gir 404-side for en adresse som ikke finnes', async () => {
    const svar = await request(app).get('/finnes-ikke').expect(404);
    assert.match(svar.text, /Siden finnes ikke/);
  });

  it('gir 404-side for en kontakt som ikke finnes', async () => {
    await request(app).get('/99999999/rediger').expect(404);
    await request(app).get('/abc/rediger').expect(404);
  });
});
