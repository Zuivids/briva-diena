-- Admin users table for secure authentication with MFA
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  totp_secret   VARCHAR(255)  DEFAULT NULL,
  mfa_enabled   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
