-- lisätään uudet tagit
INSERT INTO tag (name, group_id) VALUES ('Jatkuva haku', 1);
INSERT INTO tag (name, group_id) VALUES ('Jatkuva haku', 2);

-- poistetaan tagit (id = 4 ja 18, ks. Initial_base_data.sql)
DELETE FROM notification_tag
  WHERE tag_id IN (
    SELECT id FROM tag WHERE name = 'Kehitystyö'
  );
DELETE FROM tag WHERE name = 'Kehitystyö';

