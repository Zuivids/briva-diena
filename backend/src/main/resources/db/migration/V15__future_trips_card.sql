CREATE TABLE IF NOT EXISTS future_trips_card (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL DEFAULT 'Uzzini par jaunākiem ceļojumiem 2027',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  image_path VARCHAR(1024) NOT NULL DEFAULT ''
);

SET @existing_title = (SELECT value FROM site_content WHERE key_name = 'future_trips_card_title');
SET @existing_enabled = (SELECT value FROM site_content WHERE key_name = 'future_trips_card_enabled');

INSERT INTO future_trips_card (title, enabled, image_path)
VALUES (
  COALESCE(NULLIF(@existing_title, ''), 'Uzzini par jaunākiem ceļojumiem 2027'),
  COALESCE(@existing_enabled, 'false') = 'true',
  ''
);

DELETE FROM site_content WHERE key_name IN ('future_trips_card_title', 'future_trips_card_enabled');
