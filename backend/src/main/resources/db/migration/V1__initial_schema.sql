-- Flyway migration: complete initial schema for briva_diena
-- MariaDB compatible SQL
-- This migration includes all tables and initial data

-- Create trips table with all columns
CREATE TABLE IF NOT EXISTS trips (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_cents BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  available_spots INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  landing_section VARCHAR(20) DEFAULT NULL,
  transportation_type VARCHAR(100) DEFAULT NULL,
  accommodation VARCHAR(255) DEFAULT NULL,
  airline_company VARCHAR(100) DEFAULT NULL,
  included_baggage_size VARCHAR(100) DEFAULT NULL,
  price_included TEXT DEFAULT NULL,
  extra_charge TEXT DEFAULT NULL,
  itinerary_json TEXT DEFAULT NULL,
  trip_duration_days INT DEFAULT NULL,
  group_size INT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS trip_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT NOT NULL,
  path VARCHAR(1024),
  is_background BOOLEAN DEFAULT false,
  sort_order INT,
  CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  personal_id_number VARCHAR(20),
  passport_number VARCHAR(50),
  passport_expiration_date DATE,
  status VARCHAR(32) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registration_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  registration_id BIGINT,
  provider VARCHAR(32),
  provider_payment_id VARCHAR(255),
  status VARCHAR(32),
  received_at TIMESTAMP,
  CONSTRAINT fk_payment_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instagram_posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(1024) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert 3 complete trip examples with all values
INSERT INTO trips (name, description, start_date, end_date, price_cents, currency, available_spots, landing_section, transportation_type, accommodation, airline_company, included_baggage_size, price_included, extra_charge, itinerary_json, trip_duration_days, group_size) VALUES
(
  'Itālija — Toskāna un Roma',
  'Iepazīstiet Toskānas vīna reģionus, Florences vēsturisko centru un mūžīgo Romu. Ekskursijas, degustācijas un neaizmirstami iespaidi.',
  '2026-06-10',
  '2026-06-20',
  189900,
  'EUR',
  18,
  'popular',
  'Autobuss + Lidmašīna',
  '4 zvaigžņu viesnīcas',
  'Ryanair',
  '20 kg',
  'Lidojumi, naksmes, ēdiens, ekskursijas, vīna degustācija',
  'Alkoholiskie dzērieni (papildus), personīgie izdevumi',
  '[{"day":1,"title":"Riga to Italy","description":"Fly from Riga to Rome"},{"day":2,"title":"Rome Exploration","description":"Vatican Museums and St. Peters Basilica"},{"day":3,"title":"Tuscany Wine Tour","description":"Wine tasting in Chianti region"},{"day":4,"title":"Florence","description":"Uffizi Gallery and Cathedral"},{"day":5,"title":"Siena and San Gimignano","description":"Medieval towns"},{"day":6,"title":"Pisa and Livorno","description":"Leaning Tower and coastal area"},{"day":7,"title":"Rome Museums","description":"Roman Colosseum and Forums"},{"day":8,"title":"Shopping and Leisure","description":"Free time in Rome"},{"day":9,"title":"Return Journey","description":"Flight back to Riga"},{"day":10,"title":"Return","description":"Arrival in Riga"}]',
  10,
  18
),
(
  'Grieķija — Santorini un Atēnas',
  'Santorini baltās mājas, Egejas jūras saulrieti un Atēnu akropole. Ideāls ceļojums romantiķiem un vēstures cienītājiem.',
  '2026-07-15',
  '2026-07-25',
  229900,
  'EUR',
  14,
  'featured',
  'Lidmašīna + Prāmis',
  '5 zvaigžņu viesnīcas',
  'Wizz Air',
  '10 kg + maksimāli 2 bagāžas',
  'Lidojumi, naksmes, brokastis, ekskursijas, beachclub ieejas',
  'Ēdiens (ārpus brokastiem), personīgie izdevumi, alkohols',
  '[{"day":1,"title":"Riga to Athens","description":"Direct flight to Athens"},{"day":2,"title":"Acropolis and Museums","description":"Explore ancient Athens"},{"day":3,"title":"Day trip to Delphi","description":"Oracle sanctuary"},{"day":4,"title":"Ferry to Santorini","description":"Travel by ferry"},{"day":5,"title":"Santorini Caldera","description":"Sunset in Oia and white villages"},{"day":6,"title":"Beach and Relaxation","description":"Kamari Beach"},{"day":7,"title":"Wine Tasting","description":"Local Santorini wines"},{"day":8,"title":"Island Exploration","description":"Volcano tour"},{"day":9,"title":"Return Journey","description":"Ferry to Athens, flight to Riga"},{"day":10,"title":"Return","description":"Arrival home"}]',
  10,
  14
),
(
  'Portugāle — Lisabona un Algarve',
  'Lisabonas kalnainās ielas un Fado mūzika, Sintra pilis un Algarve zeltainās smilšu pludmales Atlantijas okeāna krastā.',
  '2026-09-05',
  '2026-09-14',
  169900,
  'EUR',
  20,
  'popular',
  'Lidmašīna + Autobuss',
  '4 zvaigžņu viesnīcas',
  'TAP Air Portugal',
  '23 kg',
  'Lidojumi, naksmes, ēdiens, ekskursijas, Fado šovs',
  'Papildus ēdiens, personīgie izdevumi',
  '[{"day":1,"title":"Riga to Lisbon","description":"Flight to Portugal"},{"day":2,"title":"Lisbon Walking Tour","description":"Alfama district and viewpoints"},{"day":3,"title":"Sintra and Cascais","description":"Royal palaces and coastal town"},{"day":4,"title":"Fado Evening","description":"Traditional Portuguese music"},{"day":5,"title":"Travel to Algarve","description":"Scenic bus ride south"},{"day":6,"title":"Algarve Beaches","description":"Lagos and golden sands"},{"day":7,"title":"Ponta da Piedade","description":"Boat tour among cliffs"},{"day":8,"title":"Local Fishing Village","description":"Olhão market and restaurants"},{"day":9,"title":"Return Journey","description":"Flight back to Riga"},{"day":10,"title":"Arrival","description":"Return home"}]',
  9,
  20
);

-- Insert sample Instagram posts
INSERT INTO instagram_posts (url, sort_order) VALUES
('https://instagram.com/p/example1', 1),
('https://instagram.com/p/example2', 2),
('https://instagram.com/p/example3', 3);

-- Insert sample trip images
INSERT INTO trip_images (trip_id, path, is_background, sort_order) VALUES
(1, '/images/italy-main.jpg', true, 1),
(1, '/images/italy-1.jpg', false, 2),
(1, '/images/italy-2.jpg', false, 3),
(2, '/images/greece-main.jpg', true, 1),
(2, '/images/greece-1.jpg', false, 2),
(2, '/images/greece-2.jpg', false, 3),
(3, '/images/portugal-main.jpg', true, 1),
(3, '/images/portugal-1.jpg', false, 2),
(3, '/images/portugal-2.jpg', false, 3);

