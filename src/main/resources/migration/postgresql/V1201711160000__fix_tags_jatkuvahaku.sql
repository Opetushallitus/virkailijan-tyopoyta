-- korjaus: korkeakouluilla (group_id 2) ei jatkuvaa hakua
DELETE FROM notification_tag
  WHERE tag_id IN (
    SELECT id FROM tag WHERE name = 'Jatkuva haku' and group_id = 2
  );
DELETE FROM tag WHERE name = 'Jatkuva haku' and group_id = 2;

