CREATE TABLE instagram_posts (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    url        VARCHAR(1024) NOT NULL,
    sort_order INT           NOT NULL DEFAULT 0,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
