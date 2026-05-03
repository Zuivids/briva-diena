-- Widen PII columns to accommodate AES-256-GCM + Base64 encoding.
-- Encrypted format: Base64(IV[12] + ciphertext + GCM-tag[16])
-- Worst-case stored length for a 50-char plaintext: ceil((50+12+16)/3)*4 = 104 chars
-- VARCHAR(512) gives ample room for any realistic ID or passport number.
--
-- IMPORTANT: Any existing plaintext rows in these columns are NOT automatically
-- re-encrypted by this migration. Before deploying to production with existing data,
-- run a data migration that reads, encrypts, and writes back each row's values.

ALTER TABLE registrations
    MODIFY COLUMN personal_id_number VARCHAR(512) DEFAULT NULL,
    MODIFY COLUMN passport_number    VARCHAR(512) DEFAULT NULL;
