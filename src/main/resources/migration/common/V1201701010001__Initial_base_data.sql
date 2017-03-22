INSERT INTO category (
  id,
  name,
  role
) VALUES (
  1,
  'Perusopetus',
  'APP_VIRKAILIJANTYOPOYTA_PERUS'
), (
  2,
  'Lukiokoulutus',
  'APP_VIRKAILIJANTYOPOYTA_2ASTE'
), (
  3,
  'Yhteishaut (lukiot)',
  'APP_VIRKAILIJANTYOPOYTA_2ASTE'
), (
  4,
  'Ammatillinen koulutus',
  'APP_VIRKAILIJANTYOPOYTA_2ASTE'
), (
  5,
  'Yhteishaut (amm.)',
  'APP_VIRKAILIJANTYOPOYTA_2ASTE'
), (
  6,
  'PJVK-haut',
  'APP_VIRKAILIJANTYOPOYTA_2ASTE'
), (
  7,
  'Erityisopetuksena järjestettävän ammatillisen koulutuksen haku',
  'APP_VIRKAILIJANTYOPOYTA_2ASTE'
), (
  8,
  'Korkeakoulutus',
  'APP_VIRKAILIJANTYOPOYTA_KK'
), (
  9,
  'Vapaan sivistystyön koulutus',
  'APP_VIRKAILIJANTYOPOYTA_MUUT'
);

INSERT INTO tag_group(
  id,
  name
) VALUES (
  1,
  'Perusopetus ja toinen aste'
), (
  2,
  'Korkeakoulutus'
), (
  3,
  'Vapaa sivistystyö'
), (
  4,
  'SPECIAL'
);

INSERT INTO tag_group_category(
  group_id,
  category_id
) VALUES (
  1,
  1
), (
  1,
  2
), (
  1,
  3
), (
  1,
  4
), (
  1,
  5
), (
  1,
  6
), (
  1,
  7
), (
  2,
  8
), (
  3,
  9
);

INSERT INTO tag (
  id,
  name,
  tag_type,
  group_id
) VALUES (
  1,
  'Aikataulut',
  NULL,
  1
), (
  2,
  'Kielikoe',
  NULL,
  1
), (
  3,
  'Koski',
  NULL,
  1

), (
  4,
  'Kehitystyö',
  NULL,
  1
), (
  5,
  'Käyttöoikeudet',
  NULL,
  1
), (
  6,
  'Opintopolku-info',
  NULL,
  1
), (
  7,
  'Opo-paketti',
  NULL,
  1
), (
  8,
  'Oppivalmiustesti',
  NULL,
  1
), (
  9,
  'Pääsy- ja soveltuvuuskoe',
  NULL,
  1
), (
  10,
  'Tarjonta',
  NULL,
  1
), (
  11,
  'Tiedonsiirrot',
  NULL,
  1
), (
  12,
  'Tilastot',
  NULL,
  1
), (
  13,
  'Valinnat',
  NULL,
  1
), (
  14,
  'Raportit',
  NULL,
  1
), (
  15,
  'Aikataulut',
  NULL,
  2
), (
  16,
  'Erillishaku',
  NULL,
  2
), (
  17,
  'Hakulomakkeen hallinta',
  NULL,
  2
), (
  18,
  'Kehitystyö',
   NULL,
  2
), (
  19,
  'Käyttöoikeudet',
  NULL,
  2
), (
  20,
  'Lisähaku',
  NULL,
  2
), (
  21,
  'Opintopolku-info',
  NULL,
  2
), (
  22,
  'Opo-paketti',
  NULL,
  2
), (
  23,
  'Raportit',
  NULL,
  2
), (
  24,
  'Tarjonta',
  NULL,
  2
), (
  25,
  'Tiedonsiirrot',
  NULL,
  2
), (
  26,
  'Tilastot',
  NULL,
  2
), (
  27,
  'Valinnat',
  NULL,
  2
), (
  28,
  'Valintakoe',
  NULL,
  2
), (
  29,
  'Yhteishaku',
  NULL,
  2
), (
  30,
  'Käyttöoikeudet',
  NULL,
  3
), (
  31,
  'Tarjonta',
  NULL,
  3
), (
  32,
  'Häiriötiedote',
  'DISRUPTION',
  4
);