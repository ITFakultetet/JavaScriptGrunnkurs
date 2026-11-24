import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { tomKontakt, validerKontakt } from '../src/validators/kontakter.js';

// ---------------------------------------------------------------------------
// Enhetstester for valideringen. De trenger verken database eller server –
// det er hele poenget med å skille valideringen ut i sin egen modul.
// ---------------------------------------------------------------------------

describe('validerKontakt – gyldig input', () => {
  it('godtar en komplett kontakt', () => {
    const resultat = validerKontakt({
      navn: 'Ola Hansen',
      epost: 'ola@example.no',
      telefon: '412 34 567',
      notat: 'Ring helst etter klokka 12.',
    });

    assert.equal(resultat.ok, true);
    assert.deepEqual(resultat.data, {
      navn: 'Ola Hansen',
      epost: 'ola@example.no',
      telefon: '412 34 567',
      notat: 'Ring helst etter klokka 12.',
    });
  });

  it('trimmer navn og gjør e-post om til små bokstaver', () => {
    const resultat = validerKontakt({ navn: '  Kari Nordmann  ', epost: '  KARI@Example.NO ' });

    assert.equal(resultat.ok, true);
    assert.equal(resultat.data.navn, 'Kari Nordmann');
    assert.equal(resultat.data.epost, 'kari@example.no');
  });

  it('gjør tomme valgfrie felt om til null', () => {
    const resultat = validerKontakt({
      navn: 'Kari',
      epost: 'kari@example.no',
      telefon: '',
      notat: '',
    });

    assert.equal(resultat.ok, true);
    assert.equal(resultat.data.telefon, null);
    assert.equal(resultat.data.notat, null);
  });

  it('godtar at valgfrie felt mangler helt (JSON-klienter)', () => {
    const resultat = validerKontakt({ navn: 'Kari', epost: 'kari@example.no' });

    assert.equal(resultat.ok, true);
    assert.equal(resultat.data.telefon, null);
    assert.equal(resultat.data.notat, null);
  });

  it('godtar norsk telefonnummer med landkode og mellomrom', () => {
    const resultat = validerKontakt({
      navn: 'Kari',
      epost: 'kari@example.no',
      telefon: '+47 412 34 567',
    });

    assert.equal(resultat.ok, true);
    assert.equal(resultat.data.telefon, '+47 412 34 567');
  });
});

describe('validerKontakt – avvist input', () => {
  it('krever navn og e-post', () => {
    const resultat = validerKontakt({});

    assert.equal(resultat.ok, false);
    assert.match(resultat.felt.navn, /påkrevd/i);
    assert.match(resultat.felt.epost, /påkrevd/i);
  });

  it('avviser for kort navn', () => {
    const resultat = validerKontakt({ navn: 'K', epost: 'kari@example.no' });

    assert.equal(resultat.ok, false);
    assert.match(resultat.felt.navn, /minst 2 tegn/i);
  });

  it('avviser ugyldig e-postadresse', () => {
    for (const epost of ['ikke-epost', 'mangler@', '@example.no', 'a@b', 'to ord@example.no']) {
      const resultat = validerKontakt({ navn: 'Kari', epost });
      assert.equal(resultat.ok, false, `«${epost}» skulle vært avvist`);
      assert.ok(resultat.felt.epost);
    }
  });

  it('avviser bokstaver i telefonnummeret', () => {
    const resultat = validerKontakt({
      navn: 'Kari',
      epost: 'kari@example.no',
      telefon: 'ring meg',
    });

    assert.equal(resultat.ok, false);
    assert.match(resultat.felt.telefon, /Bruk bare tall/i);
  });

  it('avviser for lange felt', () => {
    const resultat = validerKontakt({
      navn: 'a'.repeat(101),
      epost: 'kari@example.no',
      notat: 'x'.repeat(1001),
    });

    assert.equal(resultat.ok, false);
    assert.ok(resultat.felt.navn);
    assert.ok(resultat.felt.notat);
  });

  it('gir én melding per felt og en samlet melding', () => {
    const resultat = validerKontakt({ navn: 'K', epost: 'feil', telefon: 'xx' });

    assert.equal(resultat.ok, false);
    assert.equal(Object.keys(resultat.felt).length, 3);
    assert.equal(typeof resultat.melding, 'string');
    assert.ok(resultat.melding.length > 0);
  });

  it('takler at input er undefined eller null', () => {
    assert.equal(validerKontakt(undefined).ok, false);
    assert.equal(validerKontakt(null).ok, false);
  });
});

describe('tomKontakt', () => {
  it('gir tomme verdier for alle feltene skjemaet bruker', () => {
    assert.deepEqual(tomKontakt(), { navn: '', epost: '', telefon: '', notat: '' });
  });
});
