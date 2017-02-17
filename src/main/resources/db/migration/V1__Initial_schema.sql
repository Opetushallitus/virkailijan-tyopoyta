CREATE TABLE release(
  id SERIAL PRIMARY KEY NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  modified_by INTEGER,
  modified_at TIMESTAMP,
  sendEmail BOOLEAN
);

CREATE TABLE notification(
  id SERIAL PRIMARY KEY NOT NULL,
  release_id INTEGER NOT NULL REFERENCES release(id),
  publish_date DATE NOT NULL,
  expiry_date DATE,
  send_email BOOLEAN NOT NULL DEFAULT FALSE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE notification_content(
  notification_id INTEGER NOT NULL REFERENCES notification(id),
  language VARCHAR(2) NOT NULL,
  text TEXT,
  title VARCHAR(200),
  timeline_text VARCHAR(200),
  PRIMARY KEY (notification_id, language)
);

CREATE TABLE timeline_item(
  id SERIAL PRIMARY KEY NOT NULL,
  release_id INTEGER NOT NULL REFERENCES release(id),
  date DATE
);

CREATE TABLE timeline_content(
  timeline_id INTEGER NOT NULL REFERENCES timeline_item(id),
  language VARCHAR(2) NOT NULL,
  text TEXT,
  PRIMARY KEY (timeline_id, language)
);

CREATE TABLE tag(
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE notification_tag(
  notification_id INTEGER NOT NULL REFERENCES notification(id),
  tag_id INTEGER NOT NULL REFERENCES tag(id)
);

CREATE TABLE category(
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE release_category(
  release_id INTEGER NOT NULL REFERENCES release(id),
  category_id INTEGER NOT NULL REFERENCES category(id)
);

CREATE TABLE release_rights(
  release_id INTEGER NOT NULL REFERENCES release(id),
  usergroup_id INTEGER NOT NULL
);

CREATE TABLE user_profile(
  id INTEGER NOT NULL PRIMARY KEY,
  send_email BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_category(
  user_id INTEGER NOT NULL REFERENCES user_profile(id),
  category_id INTEGER NOT NULL REFERENCES category(id)
);

CREATE TABLE email_events(
  id SERIAL PRIMARY KEY NOT NULL AUTO_INCREMENT,
  createdAt TIMESTAMP NOT NULL,
  releaseId INTEGER NOT NULL REFERENCES release(id),
  eventType VARCHAR(50) NOT NULL
)







