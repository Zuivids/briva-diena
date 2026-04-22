-- About page images table: stores up to 3 images (slot_index 0-2)
CREATE TABLE IF NOT EXISTS about_page_images (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  slot_index INT          NOT NULL UNIQUE,
  path       VARCHAR(1024) NOT NULL
);
