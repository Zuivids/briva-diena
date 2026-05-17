ALTER TABLE registrations
    ADD COLUMN parent_id BIGINT NULL,
    ADD CONSTRAINT fk_registration_parent
        FOREIGN KEY (parent_id) REFERENCES registrations(id) ON DELETE SET NULL;
