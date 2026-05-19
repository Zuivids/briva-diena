-- Add overlay and text settings to hero_image table
ALTER TABLE hero_image
  ADD COLUMN overlay_opacity  INT          NOT NULL DEFAULT 0,
  ADD COLUMN text_content     VARCHAR(500) NOT NULL DEFAULT 'Mazas grupas – lieli iespaidi',
  ADD COLUMN text_font        VARCHAR(100) NOT NULL DEFAULT 'inherit',
  ADD COLUMN text_bold        BOOLEAN      NOT NULL DEFAULT TRUE,
  ADD COLUMN text_size        INT          NOT NULL DEFAULT 32;
