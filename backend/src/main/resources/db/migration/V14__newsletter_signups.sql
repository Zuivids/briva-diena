CREATE TABLE IF NOT EXISTS pieteikumi_jaunumiem (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pieteikumi_jaunumiem_email (email)
);
