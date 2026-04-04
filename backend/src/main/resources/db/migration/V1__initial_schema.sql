-- Flyway migration: initial schema for briva_diena
-- MariaDB compatible SQL

CREATE TABLE IF NOT EXISTS trips (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_cents BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT,
  path VARCHAR(1024),
  is_background BOOLEAN DEFAULT false,
  sort_order INT,
  CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT,
  buyer_email VARCHAR(512) NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING',
  payment_provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  provider VARCHAR(32),
  provider_payment_id VARCHAR(255),
  status VARCHAR(32),
  received_at TIMESTAMP,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
