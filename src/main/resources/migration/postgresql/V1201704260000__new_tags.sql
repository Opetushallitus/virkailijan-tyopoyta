-- Reset id sequence
SELECT setval('tag_id_seq', (SELECT MAX(id) FROM tag));

INSERT INTO tag (name, group_id) VALUES ('Yhteishaku', 1);
INSERT INTO tag (name, group_id) VALUES ('Lisähaku', 1);

