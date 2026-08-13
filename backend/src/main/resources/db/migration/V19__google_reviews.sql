CREATE TABLE IF NOT EXISTS google_reviews_cache (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  overall_rating DOUBLE NULL,
  total_rating_count INT NULL,
  reviews_json TEXT NOT NULL DEFAULT '[]',
  place_url VARCHAR(1024) NULL,
  last_fetched_at TIMESTAMP NULL,
  last_error VARCHAR(1000) NULL
);

INSERT INTO google_reviews_cache (reviews_json) VALUES ('[]');
