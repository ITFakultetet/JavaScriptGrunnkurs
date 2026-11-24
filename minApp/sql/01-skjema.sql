-- ---------------------------------------------------------------------------
-- Skjema for eksempelappen «Kontakter» (JavaScript Grunnkurs, ITFakultetet)
--
-- Kjøres med «npm run db:init». Skriptet er idempotent: det kan kjøres om og om
-- igjen uten å slette data (IF NOT EXISTS / CREATE OR REPLACE / DROP TRIGGER).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kontakter (
  id        BIGSERIAL PRIMARY KEY,
  navn      TEXT NOT NULL,
  epost     TEXT NOT NULL,
  telefon   TEXT,
  notat     TEXT,
  opprettet TIMESTAMPTZ NOT NULL DEFAULT now(),
  endret    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E-post skal være unik uten å bry seg om store/små bokstaver. En vanlig
-- UNIQUE er case-sensitiv i PostgreSQL («Ola@x.no» og «ola@x.no» ville begge
-- sluppet inn), så vi legger unik-indeksen på lower(epost) i stedet.
-- Applikasjonen normaliserer også e-posten til små bokstaver før lagring –
-- indeksen er sikkerhetsnettet som gjelder uansett hvem som skriver.
CREATE UNIQUE INDEX IF NOT EXISTS kontakter_epost_unik
  ON kontakter (lower(epost));

-- Indeks som hjelper søk og sortering på navn.
CREATE INDEX IF NOT EXISTS kontakter_navn_idx
  ON kontakter (navn);

-- «endret» holdes oppdatert av databasen selv, ikke av applikasjonskoden.
-- Da blir tidsstemplet riktig også når noen retter en rad direkte med psql,
-- og vi slipper å huske på feltet i hver eneste UPDATE.
CREATE OR REPLACE FUNCTION sett_endret()
RETURNS trigger AS $$
BEGIN
  NEW.endret := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kontakter_sett_endret ON kontakter;

CREATE TRIGGER kontakter_sett_endret
  BEFORE UPDATE ON kontakter
  FOR EACH ROW
  EXECUTE FUNCTION sett_endret();
