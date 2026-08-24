--- Uudet kohdennuskategoriat perusopetuksen alle
-- käyttöoikeus: APP_VIRKAILIJANTYOPOYTA_PERUS (sama kuin Perusopetus-kategorialla)
INSERT INTO category (id, name, role) VALUES (
  11,
  'aikuistenperusopetus',
  'APP_VIRKAILIJANTYOPOYTA_PERUS'
), (
  12,
  'perusopetukseenvalmistavaopetus',
  'APP_VIRKAILIJANTYOPOYTA_PERUS'
);

-- Liitetään avainsanaryhmään 1 (perus = Perusopetus ja toinen aste), jotta avainsanat
-- ovat valittavissa kun vain uusi kategoria on valittuna
INSERT INTO tag_group_category (group_id, category_id) VALUES (1, 11), (1, 12);
