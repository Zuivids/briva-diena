-- Flyway migration: initial schema for briva_diena
-- MariaDB compatible SQL

CREATE TABLE IF NOT EXISTS trips (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_cents BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  available_spots INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


