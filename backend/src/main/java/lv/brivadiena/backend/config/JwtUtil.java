package lv.brivadiena.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // Must be at least 32 characters (256 bits) for HS256
    @Value("${app.jwt-secret:your-local-dev-secret-key-change-in-production-min32chars}")
    private String jwtSecret;

    private static final long ACCESS_TOKEN_EXPIRY_MS = 8L * 60 * 60 * 1000; // 8 hours
    private static final long PRE_AUTH_TOKEN_EXPIRY_MS = 5L * 60 * 1000; // 5 minutes

    private SecretKey getKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Full access token issued after successful MFA verification. */
    public String generateAccessToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY_MS))
                .signWith(getKey())
                .compact();
    }

    /**
     * Short-lived pre-authentication token issued after password check.
     * Must be exchanged for a full access token by completing MFA.
     */
    public String generatePreAuthToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("type", "pre_auth")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + PRE_AUTH_TOKEN_EXPIRY_MS))
                .signWith(getKey())
                .compact();
    }

    /** Parse and validate a token. Throws JwtException if invalid or expired. */
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAccessToken(Claims claims) {
        return "access".equals(claims.get("type", String.class));
    }

    public boolean isPreAuthToken(Claims claims) {
        return "pre_auth".equals(claims.get("type", String.class));
    }

    public long getAccessTokenExpirySeconds() {
        return ACCESS_TOKEN_EXPIRY_MS / 1000;
    }
}
