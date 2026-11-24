-- ---------------------------------------------------------------------------
-- Eksempeldata: 12 norske kontakter.
--
-- ON CONFLICT DO NOTHING gjør skriptet trygt å kjøre flere ganger: rader som
-- allerede finnes (samme lower(epost) som i den unike indeksen) hoppes over i
-- stedet for å gi en feil.
-- ---------------------------------------------------------------------------

INSERT INTO kontakter (navn, epost, telefon, notat) VALUES
  ('Kari Nordmann',        'kari.nordmann@example.no',   '412 34 567', 'Prosjektleder for nettsatsingen.'),
  ('Ola Hansen',           'ola.hansen@example.no',      '918 76 543', 'Teknisk kontaktperson.'),
  ('Ingrid Solberg',       'ingrid.solberg@example.no',  '900 12 345', 'Jobber med universell utforming.'),
  ('Magnus Berg',          'magnus.berg@example.no',     '934 55 210', NULL),
  ('Silje Aas',            'silje.aas@example.no',       '476 89 012', 'Foretrekker e-post fremfor telefon.'),
  ('Henrik Lund',          'henrik.lund@example.no',     '951 23 478', 'Regnskap og faktura.'),
  ('Nora Bakken',          'nora.bakken@example.no',     '402 98 776', 'Kurskoordinator.'),
  ('Jonas Myhre',          'jonas.myhre@example.no',     '918 00 111', NULL),
  ('Camilla Strand',       'camilla.strand@example.no',  '920 45 678', 'Leverandør av designmaler.'),
  ('Thomas Ellingsen',     'thomas.ellingsen@example.no','484 12 909', 'Support, ukedager 09–15.'),
  ('Marianne Haugen',      'marianne.haugen@example.no', '913 77 240', 'Databehandleravtale signert 2025.'),
  ('Even Kristiansen',     'even.kristiansen@example.no','977 31 456', NULL)
ON CONFLICT DO NOTHING;
