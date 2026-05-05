CREATE TABLE faq_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    question   TEXT          NOT NULL,
    answer     TEXT          NOT NULL,
    sort_order INT           NOT NULL DEFAULT 0
);
