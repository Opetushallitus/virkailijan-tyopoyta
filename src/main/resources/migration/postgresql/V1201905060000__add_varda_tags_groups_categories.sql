--- OY-284
--- Vardaan liittyvät lisäykset
-- Varhaiskasvatus-kategoria, jonka alle Varda-avainsana
-- käyttöoikeusryhmät: ...
INSERT INTO category (id, name, role) VALUES (
  10,
  'varhaiskasvatus',
  'APP_VIRKAILIJANTYOPOYTA_VARHAIS'
);
INSERT INTO tag_group (id, name) VALUES (5, 'Varhaiskasvatus');
INSERT INTO tag (name, group_id) VALUES ('Varda', 5);
INSERT INTO tag_group_category (group_id, category_id) VALUES (5, 10);
