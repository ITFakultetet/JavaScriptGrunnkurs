// ---------------------------------------------------------------------------
// Frontend for kontaktoverikten.
//
// Alt her er «progressiv forbedring»: uten JavaScript fungerer siden som før,
// med vanlige skjema-POST-er og full sidelasting. Med JavaScript på får du
// live-søk (med debounce), sletting via fetch med bekreftelsesmodal, og toast.
//
// SIKKERHET: vi bygger DOM med createElement og textContent – aldri innerHTML
// med data fra databasen. En kontakt som heter «<img onerror=...>» skal vises
// som tekst, ikke kjøres som kode.
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300;
const TOAST_MS = 4000;

const tabell = document.getElementById('kontaktTabell');

if (tabell) {
  startOversikt(tabell);
}

function startOversikt(tabellElement) {
  const tbody = tabellElement.querySelector('tbody');
  const treffEl = document.getElementById('treff');
  const pagineringEl = document.getElementById('paginering');
  const sokFelt = document.getElementById('sokFelt');
  const modalEl = document.getElementById('slettModal');
  const slettNavnEl = document.getElementById('slettNavn');
  const slettBekreft = document.getElementById('slettBekreft');

  // Modal er en Bootstrap-komponent. Vi lager den bare hvis markupen finnes,
  // så koden ikke krasjer på sider uten modal.
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

  // Tilstanden vi henter data med. Holdes i ett objekt, så det er tydelig
  // hva som styrer spørringen.
  const tilstand = {
    sok: tabellElement.dataset.sok ?? '',
    sortering: tabellElement.dataset.sortering ?? 'navn',
    retning: tabellElement.dataset.retning ?? 'asc',
    side: Number(tabellElement.dataset.side ?? '1') || 1,
  };

  let timer = null;
  let aktivtSkjema = null;
  let sisteForespoersel = 0;

  // --- Henting ------------------------------------------------------------

  async function hentKontakter() {
    const parametre = new URLSearchParams({
      sok: tilstand.sok,
      sortering: tilstand.sortering,
      retning: tilstand.retning,
      side: String(tilstand.side),
    });

    const svar = await fetch(`/api/kontakter?${parametre}`, {
      headers: { Accept: 'application/json' },
    });

    if (!svar.ok) throw new Error(`Serveren svarte ${svar.status}`);
    return svar.json();
  }

  async function oppdater() {
    // Hver forespørsel får et nummer. Kommer svarene i utakt (fordi du skrev
    // videre mens den forrige hentingen pågikk), bruker vi bare det nyeste –
    // ellers kan et gammelt svar overskrive et nytt søkeresultat.
    const nummer = ++sisteForespoersel;
    tabellElement.setAttribute('aria-busy', 'true');

    try {
      const data = await hentKontakter();
      if (nummer !== sisteForespoersel) return;
      tegnAlt(data);
    } catch (feil) {
      console.error(feil);
      visVarsel('Fikk ikke kontakt med serveren. Prøv igjen.', 'feil');
    } finally {
      if (nummer === sisteForespoersel) tabellElement.removeAttribute('aria-busy');
    }
  }

  // --- Tegning ------------------------------------------------------------

  function tegnAlt(data) {
    tegnRader(data);

    if (treffEl) {
      const antall = `${data.totalt} ${data.totalt === 1 ? 'kontakt' : 'kontakter'}`;
      treffEl.textContent = tilstand.sok ? `${antall} for «${tilstand.sok}»` : antall;
    }

    tegnPaginering(data);
  }

  function tegnRader(data) {
    tbody.replaceChildren();

    if (data.rader.length === 0) {
      tbody.append(lagTomTilstand(tilstand.sok));
      return;
    }

    for (const kontakt of data.rader) {
      tbody.append(lagRad(kontakt));
    }
  }

  function lagCelle(tekst, klasse) {
    const celle = document.createElement('td');
    if (klasse) celle.className = klasse;
    celle.textContent = tekst;
    return celle;
  }

  function lagRad(kontakt) {
    const rad = document.createElement('tr');
    rad.dataset.id = String(kontakt.id);

    // Navn + eventuelt notat, med en sirkel med initialen foran.
    const navnCelle = document.createElement('td');
    const navnBoks = document.createElement('div');
    navnBoks.className = 'celle-navn';

    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = kontakt.navn.trim().charAt(0).toUpperCase();

    const navnOgNotat = document.createElement('span');
    navnOgNotat.className = 'navn-og-notat';

    const navnTekst = document.createElement('span');
    navnTekst.className = 'navn-tekst';
    navnTekst.textContent = kontakt.navn;
    navnOgNotat.append(navnTekst);

    if (kontakt.notat) {
      const notat = document.createElement('span');
      notat.className = 'notat-tekst';
      notat.title = kontakt.notat;
      notat.textContent = kontakt.notat;
      navnOgNotat.append(notat);
    }

    navnBoks.append(avatar, navnOgNotat);
    navnCelle.append(navnBoks);

    // E-post som mailto-lenke.
    const epostCelle = document.createElement('td');
    const epostLenke = document.createElement('a');
    epostLenke.className = 'epost-lenke';
    epostLenke.href = `mailto:${kontakt.epost}`;
    epostLenke.textContent = kontakt.epost;
    epostCelle.append(epostLenke);

    // Handlinger: Rediger-lenke + skjema for sletting (samme som server-side).
    const handlingCelle = document.createElement('td');
    handlingCelle.className = 'celle-handlinger';

    const rediger = document.createElement('a');
    rediger.className = 'btn btn-liten btn-lys';
    rediger.href = `/${kontakt.id}/rediger`;
    rediger.textContent = 'Rediger';

    const skjema = document.createElement('form');
    skjema.className = 'slett-skjema';
    skjema.method = 'post';
    skjema.action = `/${kontakt.id}/slett`;
    skjema.dataset.api = `/api/kontakter/${kontakt.id}`;
    skjema.dataset.navn = kontakt.navn;

    const slettKnapp = document.createElement('button');
    slettKnapp.className = 'btn btn-liten btn-fare-lys';
    slettKnapp.type = 'submit';
    slettKnapp.textContent = 'Slett';

    skjema.append(slettKnapp);
    handlingCelle.append(rediger, skjema);

    rad.append(
      navnCelle,
      epostCelle,
      lagCelle(kontakt.telefon || '–', 'celle-telefon'),
      lagCelle(formaterDato(kontakt.endret), 'celle-dato'),
      handlingCelle
    );

    return rad;
  }

  function lagTomTilstand(sok) {
    const rad = document.createElement('tr');
    const celle = document.createElement('td');
    celle.colSpan = 5;

    const boks = document.createElement('div');
    boks.className = 'tom-tilstand';

    const overskrift = document.createElement('h2');
    const tekst = document.createElement('p');

    if (sok) {
      overskrift.textContent = `Ingen treff på «${sok}»`;
      tekst.textContent = 'Prøv et annet søkeord, eller tøm søkefeltet.';
    } else {
      overskrift.textContent = 'Ingen kontakter ennå';
      tekst.textContent = 'Legg inn den første kontakten for å komme i gang.';

      const knapp = document.createElement('a');
      knapp.className = 'btn btn-primaer';
      knapp.href = '/ny';
      knapp.textContent = '+ Ny kontakt';
      boks.append(overskrift, tekst, knapp);
      celle.append(boks);
      rad.append(celle);
      return rad;
    }

    boks.append(overskrift, tekst);
    celle.append(boks);
    rad.append(celle);
    return rad;
  }

  function tegnPaginering(data) {
    if (!pagineringEl) return;
    pagineringEl.replaceChildren();

    const antallSider = Math.max(1, Math.ceil(data.totalt / data.perSide));
    if (antallSider <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'paginering';
    nav.setAttribute('aria-label', 'Sidenavigering');

    const liste = document.createElement('ul');
    liste.className = 'paginering-liste';

    liste.append(lagSidePunkt('Forrige', data.side - 1, data.side <= 1));

    for (let nr = 1; nr <= antallSider; nr++) {
      // Vis første, siste og sidene rundt den aktive – med «…» i mellom.
      const erNær = Math.abs(nr - data.side) <= 1;
      if (nr !== 1 && nr !== antallSider && !erNær) {
        if (!liste.lastElementChild?.classList.contains('side-avstand-boks')) {
          const avstand = document.createElement('li');
          avstand.className = 'side-avstand-boks';
          const prikker = document.createElement('span');
          prikker.className = 'side-avstand';
          prikker.setAttribute('aria-hidden', 'true');
          prikker.textContent = '…';
          avstand.append(prikker);
          liste.append(avstand);
        }
        continue;
      }

      const li = document.createElement('li');
      if (nr === data.side) {
        const naa = document.createElement('span');
        naa.className = 'side-knapp er-her';
        naa.setAttribute('aria-current', 'page');
        naa.textContent = String(nr);
        li.append(naa);
      } else {
        li.append(lagSidePunkt(String(nr), nr, false));
      }
      liste.append(li);
    }

    liste.append(lagSidePunkt('Neste', data.side + 1, data.side >= antallSider));

    nav.append(liste);
    pagineringEl.append(nav);
  }

  function lagSidePunkt(tekst, side, deaktivert) {
    const li = document.createElement('li');

    if (deaktivert) {
      const span = document.createElement('span');
      span.className = 'side-knapp deaktivert';
      span.setAttribute('aria-disabled', 'true');
      span.textContent = tekst;
      li.append(span);
      return li;
    }

    const lenke = document.createElement('a');
    lenke.className = 'side-knapp';
    lenke.href = lagLenke(side);
    lenke.dataset.side = String(side);
    lenke.textContent = tekst;
    li.append(lenke);
    return li;
  }

  function lagLenke(side) {
    const parametre = new URLSearchParams({
      sortering: tilstand.sortering,
      retning: tilstand.retning,
    });
    if (tilstand.sok) parametre.set('sok', tilstand.sok);
    if (side > 1) parametre.set('side', String(side));
    return `/?${parametre}`;
  }

  // --- Toast --------------------------------------------------------------

  function visVarsel(tekst, type = 'suksess') {
    const beholder = document.getElementById('varselBeholder');
    const mal = document.getElementById('varselMal');
    if (!beholder || !mal) return;

    const node = mal.content.cloneNode(true);
    const toastEl = node.querySelector('.toast');
    toastEl.classList.add(`varsel-${type}`);
    toastEl.querySelector('.varsel-tekst').textContent = tekst;
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());

    beholder.append(toastEl);
    new bootstrap.Toast(toastEl, { delay: TOAST_MS }).show();
  }

  // --- Live søk -----------------------------------------------------------

  if (sokFelt) {
    sokFelt.addEventListener('input', () => {
      // Debounce: vent til brukeren har sluttet å skrive. Uten dette sender vi
      // én spørring per tastetrykk, som er unødvendig last på serveren.
      clearTimeout(timer);
      timer = setTimeout(() => {
        tilstand.sok = sokFelt.value.trim();
        tilstand.side = 1;
        oppdater();

        // Oppdater adresselinjen slik at søket kan bokmerkes eller deles.
        const url = new URL(window.location.href);
        if (tilstand.sok) url.searchParams.set('sok', tilstand.sok);
        else url.searchParams.delete('sok');
        url.searchParams.delete('side');
        window.history.replaceState({}, '', url);
      }, DEBOUNCE_MS);
    });
  }

  // --- Paginering uten reload --------------------------------------------

  if (pagineringEl) {
    pagineringEl.addEventListener('click', (hendelse) => {
      const lenke = hendelse.target.closest('a.side-knapp');
      if (!lenke) return;
      hendelse.preventDefault();
      tilstand.side = Number(lenke.dataset.side) || 1;
      oppdater();
    });
  }

  // --- Sletting med bekreftelse -----------------------------------------

  // Vi lytter på submit på dokumentnivå, slik at det også gjelder rader som er
  // laget av JavaScript etter at siden ble lastet (delegert hendelseshåndtering).
  document.addEventListener('submit', (hendelse) => {
    const skjema = hendelse.target.closest ? hendelse.target.closest('.slett-skjema') : null;
    if (!skjema) return;

    // Stopp den vanlige innsendingen – vi vil vise en modal først.
    hendelse.preventDefault();

    if (!modal) {
      // Uten modal (skal ikke skje) faller vi tilbake til vanlig POST.
      skjema.submit();
      return;
    }

    aktivtSkjema = skjema;
    if (slettNavnEl) slettNavnEl.textContent = skjema.dataset.navn ?? 'kontakten';
    modal.show();
  });

  if (slettBekreft) {
    slettBekreft.addEventListener('click', async () => {
      if (!aktivtSkjema) return;

      const skjema = aktivtSkjema;
      const navn = skjema.dataset.navn ?? 'kontakten';
      slettBekreft.disabled = true;

      try {
        const svar = await fetch(skjema.dataset.api, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });

        if (svar.status === 204) {
          // 204 No Content = slettet. Fjern raden med en gang, og hent listen
          // på nytt så antall, paginering og tom-tilstand blir riktig.
          skjema.closest('tr')?.remove();
          visVarsel(`«${navn}» ble slettet.`);
          await oppdater();
        } else if (svar.status === 404) {
          visVarsel('Kontakten finnes ikke lenger.', 'feil');
          await oppdater();
        } else {
          const data = await svar.json().catch(() => ({}));
          visVarsel(data?.feil?.melding ?? 'Kunne ikke slette kontakten.', 'feil');
        }
      } catch {
        visVarsel('Fikk ikke kontakt med serveren.', 'feil');
      } finally {
        slettBekreft.disabled = false;
        aktivtSkjema = null;
        modal?.hide();
      }
    });
  }
}

/** Dato i norsk format, samme som på serveren: 24.11.2026 */
function formaterDato(verdi) {
  if (!verdi) return '–';
  const dato = new Date(verdi);
  if (Number.isNaN(dato.getTime())) return '–';
  return new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dato);
}
