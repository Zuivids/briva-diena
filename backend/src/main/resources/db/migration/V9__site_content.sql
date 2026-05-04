-- Stores editable site text content (key-value pairs)
CREATE TABLE IF NOT EXISTS site_content (
  key_name   VARCHAR(255) PRIMARY KEY,
  value      TEXT NOT NULL
);

-- Seed default values
INSERT INTO site_content (key_name, value) VALUES
  ('about_text', 'Brīva diena ir ceļojumu aģentūra, kas piedāvā neatvairāmas ceļojuma pieredzes par pieņemamām cenām.'),
  ('about_page_content', 'Brīva diena ir ceļojumu aģentūra, kas dibināta ar mērķi piedāvāt augstas kvalitātes grupu ceļojumus par pieejamām cenām.\n\nMēs specializējamies organizētu ceļojumu piedāvāšanā uz Eiropas skaistākajām vietām. Katrs ceļojums ir rūpīgi plānots, lai nodrošinātu neaizmirstamu pieredzi.\n\nMūsu komanda ir gatava atbildēt uz visiem jūsu jautājumiem un palīdzēt izvēlēties ideālo ceļojumu tieši jums.');
