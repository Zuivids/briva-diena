package lv.brivadiena.backend.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * JPA AttributeConverter that transparently encrypts/decrypts sensitive string
 * columns
 * using AES-256-GCM (authenticated encryption — provides both confidentiality
 * and integrity).
 *
 * Storage format: Base64( IV(12 bytes) + ciphertext + GCM auth tag(16 bytes) )
 *
 * The Spring-managed instance receives the key via @Value and stores it in a
 * static field.
 * Hibernate creates its own instance for entity mapping; both share the same
 * static field.
 */
@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    // Static so Hibernate-instantiated converters share the same key
    private static byte[] AES_KEY;

    @Value("${app.encryption-key:local-dev-encryption-key-change-in-prod}")
    public void setEncryptionKey(String rawKey) {
        try {
            // Derive a stable 32-byte (256-bit) AES key from the config string via SHA-256
            AES_KEY = MessageDigest.getInstance("SHA-256")
                    .digest(rawKey.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialise field-encryption key", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String plaintext) {
        if (plaintext == null || plaintext.isBlank()) {
            return null;
        }
        if (AES_KEY == null) {
            throw new IllegalStateException("Encryption key not initialised — check app.encryption-key property");
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(AES_KEY, "AES"),
                    new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Prepend IV so each row has a unique IV
            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Field encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String encrypted) {
        if (encrypted == null || encrypted.isBlank()) {
            return null;
        }
        if (AES_KEY == null) {
            throw new IllegalStateException("Encryption key not initialised — check app.encryption-key property");
        }
        try {
            byte[] combined = Base64.getDecoder().decode(encrypted);

            // A valid encrypted value is always at least IV(12) + tag(16) = 28 bytes
            if (combined.length < GCM_IV_LENGTH + 16) {
                // Not encrypted (legacy plaintext) — return as-is
                return encrypted;
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] ciphertext = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            System.arraycopy(combined, GCM_IV_LENGTH, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(AES_KEY, "AES"),
                    new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            // Not valid Base64 → legacy plaintext row
            return encrypted;
        } catch (Exception e) {
            throw new RuntimeException("Field decryption failed", e);
        }
    }
}
