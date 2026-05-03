package lv.brivadiena.backend.config;

import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

/**
 * TOTP (Time-based One-Time Password) utility — RFC 6238 / Google Authenticator compatible.
 * Uses HMAC-SHA1, 6 digits, 30-second time step.
 */
@Component
public class TotpUtil {

    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final int WINDOW = 1; // accept ±1 time step to handle clock drift

    /** Generate a random Base32-encoded secret suitable for a TOTP authenticator app. */
    public String generateSecret() {
        byte[] bytes = new byte[20]; // 160 bits
        new SecureRandom().nextBytes(bytes);
        return new Base32().encodeToString(bytes).replace("=", "");
    }

    /**
     * Verify a 6-digit code against the stored secret.
     * Accepts codes from the previous, current, and next time window.
     */
    public boolean verify(String secret, String code) {
        if (secret == null || code == null || code.length() != CODE_DIGITS) {
            return false;
        }
        long currentWindow = System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;
        for (int offset = -WINDOW; offset <= WINDOW; offset++) {
            if (calculateCode(secret, currentWindow + offset).equals(code)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Build the otpauth:// URI for QR code generation.
     * Compatible with Google Authenticator, Authy, and any RFC 6238 app.
     */
    public String getOtpAuthUri(String secret, String accountName, String issuer) {
        return String.format(
                "otpauth://totp/%s%%3A%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                encode(issuer), encode(accountName), secret, encode(issuer)
        );
    }

    private String calculateCode(String secret, long timeWindow) {
        try {
            byte[] keyBytes = new Base32().decode(secret.toUpperCase());
            byte[] data = new byte[8];
            long value = timeWindow;
            for (int i = 7; i >= 0; i--) {
                data[i] = (byte) (value & 0xFF);
                value >>= 8;
            }
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(keyBytes, "RAW"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0F;
            long truncated = ((hash[offset]     & 0x7F) << 24)
                           | ((hash[offset + 1] & 0xFF) << 16)
                           | ((hash[offset + 2] & 0xFF) << 8)
                           |  (hash[offset + 3] & 0xFF);

            return String.format("%0" + CODE_DIGITS + "d", truncated % 1_000_000L);
        } catch (Exception e) {
            throw new RuntimeException("TOTP calculation failed", e);
        }
    }

    private String encode(String value) {
        try {
            return java.net.URLEncoder.encode(value, "UTF-8");
        } catch (Exception e) {
            return value;
        }
    }
}
