INSERT INTO release (
  id,
  deleted,
  created_by,
  created_at,
  modified_by,
  modified_at,
  send_email
) VALUES (
  1,
  FALSE,
  0,
  CAST('2016-12-29 13:27:000' AS TIMESTAMP),
  NULL,
  NULL,
  FALSE
);

INSERT INTO notification (
  id,
  release_id,
  publish_date,
  expiry_date,
  send_email,
  deleted
) VALUES (
  1,
  1,
  CAST('2016-12-30' AS DATE),
  NULL,
  FALSE,
  FALSE
);

INSERT INTO notification_content (
  notification_id,
  language,
  text,
  title,
  timeline_text
) VALUES (
  1,
  'fi',
  '<p><strong>AIKU</strong>-palvelussa käyttökatko 16.6.2016 kello 01:00-03:00</p>',
  'Häiriötiedote',
  'Häiriötiedote'
);

INSERT INTO timeline_item (
  id,
  release_id,
  date
) VALUES (
  1,
  1,
  CAST('2016-05-23' AS DATE)
);

INSERT INTO timeline_content (
  timeline_id,
  language,
  text
) VALUES (
  1,
  'fi',
  'AIKU-palvelussa  käyttökatko'
);

INSERT INTO release (
  id,
  deleted,
  created_by,
  created_at,
  modified_by,
  modified_at,
  send_email
) VALUES (
  2,
  FALSE,
  0,
  CAST('2016-12-29 13:27:000' AS TIMESTAMP),
  NULL,
  NULL,
  FALSE
);

INSERT INTO notification (
  id,
  release_id,
  publish_date,
  expiry_date,
  send_email,
  deleted
) VALUES (
  2,
  2,
  CAST('2016-12-30' AS DATE),
  NULL,
  FALSE,
  FALSE
);

INSERT INTO notification_content (
  notification_id,
  language,
  text,
  title,
  timeline_text
) VALUES (
  2,
  'fi',
  '<p>Opintopolussa versiopäivitys tänään 23.5 klo 16:30-17:00. Hakemusten käsittely ja Oma Opintopolku alhaalla</p>',
  'Erityisopetuksena järjestettävän ammatillisen koulutuksen haun valinnat',
  'Haun valinnat'
);

INSERT INTO release (
  id,
  deleted,
  created_by,
  created_at,
  modified_by,
  modified_at,
  send_email
) VALUES (
  3,
  FALSE,
  0,
  CAST('2016-12-29 13:27:000' AS TIMESTAMP),
  NULL,
  NULL,
  FALSE
);

INSERT INTO notification (
  id,
  release_id,
  publish_date,
  expiry_date,
  send_email,
  deleted
) VALUES (
  3,
  3,
  CAST('2016-12-30' AS DATE),
  NULL,
  FALSE,
  FALSE
);

INSERT INTO notification_content (
  notification_id,
  language,
  text,
  title,
  timeline_text
) VALUES (
  3,
  'fi',
  '<p>OPH:n tarkennetun aikataulun mukaisesti kevään yhteishaun koetulokset ja muut pisteet sekä harkintaan</p>',
  'Koetulokset ja harkintaan perustuvan valinnan päätökset sekä aloituspaikat tallennettavatt',
  'Koetulokset'
);

INSERT INTO timeline_item (
  id,
  release_id,
  date
) VALUES (
  2,
  3,
  CAST('2016-05-26' AS DATE)
);

INSERT INTO timeline_content (
  timeline_id,
  language,
  text
) VALUES (
  2,
  'fi',
  'Koetulokset'
);

INSERT INTO release (
  id,
  deleted,
  created_by,
  created_at,
  modified_by,
  modified_at,
  send_email
) VALUES (
  4,
  FALSE,
  0,
  CAST('2016-12-29 13:27:000' AS TIMESTAMP),
  NULL,
  NULL,
  FALSE
);

INSERT INTO notification (
  id,
  release_id,
  publish_date,
  expiry_date,
  send_email,
  deleted
) VALUES (
  4,
  4,
  CAST('2016-05-23' AS DATE),
  NULL,
  FALSE,
  FALSE
);

INSERT INTO notification_content (
  notification_id,
  language,
  text,
  title,
  timeline_text
) VALUES (
  4,
  'fi',
  '<p>Pääsy-ja-soveltuvuuskokeiden-aihiot-kevät-2016</p>',
  'Pääsy- ja soveltuvuuskoeaihiot 2016',
  'Pääsy- ja soveltuvuuskoeaihiot 2016'
);

INSERT INTO release (
  id,
  deleted,
  created_by,
  created_at,
  modified_by,
  modified_at,
  send_email
) VALUES (
  5,
  FALSE,
  0,
  CAST('2016-12-29 13:27:000' AS TIMESTAMP),
  NULL,
  NULL,
  FALSE
);

INSERT INTO notification (
  id,
  release_id,
  publish_date,
  expiry_date,
  send_email,
  deleted
) VALUES (
  5,
  5,
  CAST('2016-12-31' AS DATE),
  NULL,
  FALSE,
  FALSE
);

INSERT INTO notification_content (
  notification_id,
  language,
  text,
  title,
  timeline_text
) VALUES (
  5,
  'fi',
  '<p>Opintopolussa versiopäivitys tänään 23.5 klo 16:30-17:00. Hakemusten käsittely ja Oma Opintopolku alhaalla</p>',
  'Versiopäivitys 23.5 klo 16.30-17.00',
  'Versiopäivitys'
);

INSERT INTO timeline_item (
  id,
  release_id,
  date
) VALUES (
  3,
  5,
  CAST('2016-05-26' AS DATE)
);

INSERT INTO timeline_content (
  timeline_id,
  language,
  text
) VALUES (
  3,
  'fi',
  'Opintopolussa versiopäivitys'
);
