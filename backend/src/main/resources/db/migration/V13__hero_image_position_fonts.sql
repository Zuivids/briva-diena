-- Add text position and custom Google Fonts list to hero_image table
ALTER TABLE hero_image
  ADD COLUMN text_position VARCHAR(10)  NOT NULL DEFAULT 'left',
  ADD COLUMN google_fonts  VARCHAR(500) NOT NULL DEFAULT '';
