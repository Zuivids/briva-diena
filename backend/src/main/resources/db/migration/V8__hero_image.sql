-- Stores the hero image path for the landing page
CREATE TABLE IF NOT EXISTS hero_image (
  id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(1024) NOT NULL
);
