INSERT INTO category(name, role)
VALUES ('Perusopetus', 'APP_VIRKAILIJANTYOPOYTA_PERUS');

INSERT INTO category(name, role)
VALUES ('Lukiokoulutus', 'APP_VIRKAILIJANTYOPOYTA_2ASTE');

INSERT INTO tag(name, tag_type, group_id)
VALUES ('TESTI1', 'HÄIRIÖ', 1);

INSERT INTO tag(name, tag_type, group_id)
VALUES ('HAXXXED', 'TERROR', 2);

INSERT INTO tag_group(name)
VALUES ('perus');

INSERT INTO tag_group(name)
VALUES ('erikois');

INSERT INTO tag_group_category(group_id, category_id)
VALUES (2, 1);

INSERT INTO tag_group_category(group_id, category_id)
VALUES (1, 2);

INSERT INTO release (id, deleted)
VALUES (6, FALSE);

INSERT INTO notification (id, release_id, publish_date, expiry_date, created_by, created_at, modified_by, modified_at, deleted)
VALUES (6, 6, CAST('2021-10-22' AS DATE), NULL, '', CAST('2021-10-22 14:27:000' AS TIMESTAMP), NULL, NULL, FALSE);

INSERT INTO notification_content (notification_id, language, text, title)
VALUES (6, 'fi', '<p>HAXXORED BY IT-ANKKA</p>', 'HÄIRIÖ');

INSERT INTO timeline_item (id, release_id, date)
VALUES (4, 6, CAST('2021-10-22' AS DATE));

INSERT INTO timeline_content (timeline_id, language, text)
VALUES (4, 'fi', 'HÄIRIÖ');

INSERT INTO notification_tag(notification_id, tag_id)
VALUES (6, 1);

INSERT INTO release (id, deleted)
VALUES (7, FALSE);

INSERT INTO notification (id, release_id, publish_date, expiry_date, created_by, created_at, modified_by, modified_at, deleted)
VALUES (7, 7, CAST('2021-10-22' AS DATE), NULL, '', CAST('2021-10-22 14:27:000' AS TIMESTAMP), NULL, NULL, FALSE);

INSERT INTO notification_content (notification_id, language, text, title)
VALUES (7, 'fi', '<p>Bäk in bizniz!</p>', 'TIEDOTE');

INSERT INTO timeline_item (id, release_id, date)
VALUES (5, 7, CAST('2021-10-22' AS DATE));

INSERT INTO timeline_content (timeline_id, language, text)
VALUES (5, 'fi', 'TIEDOTE');

INSERT INTO notification_tag(notification_id, tag_id)
VALUES (7, 2);

INSERT INTO release_category(release_id, category_id)
VALUES (7, 1);

INSERT INTO release_usergroup(release_id, usergroup_id)
VALUES (7, 1);

INSERT INTO user_profile(user_id, send_email)
VALUES ('userId', false);

INSERT INTO user_category(user_id, category_id)
VALUES ('userId', 1);