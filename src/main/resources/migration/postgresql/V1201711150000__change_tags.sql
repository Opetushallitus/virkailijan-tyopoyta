-- lisätään uusi tag
INSERT INTO tag (name, group_id) VALUES ('Jatkuva haku', 1);

-- poistetaan tag (id = 4, ks. Initial_base_data.sql)
DELETE FROM tag WHERE name = 'Kehitystyö';

