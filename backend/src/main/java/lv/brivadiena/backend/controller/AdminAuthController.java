package lv.brivadiena.backend.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lv.brivadiena.backend.config.JwtUtil;
import lv.brivadiena.backend.config.TotpUtil;
import lv.brivadiena.backend.model.AdminUser;
import lv.brivadiena.backend.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TotpUtil totpUtil;

    /**
     * Step 1 — validate username + password.
     * Returns a short-lived pre-auth token plus MFA instructions.
     *
     * Response when MFA not yet configured (first login):
     *   { mfaSetupRequired: true, preToken, secret, qrCodeUri }
     *
     * Response when MFA already configured:
     *   { mfaRequired: true, preToken }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password required"));
        }

        Optional<AdminUser> userOpt = adminUserRepository.findByUsername(username);

        // Use constant-time comparison to prevent user enumeration via timing
        boolean credentialsValid = userOpt.isPresent()
                && passwordEncoder.matches(password, userOpt.get().getPasswordHash());

        if (!credentialsValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        AdminUser user = userOpt.get();
        String preToken = jwtUtil.generatePreAuthToken(username);

        if (!user.isMfaEnabled()) {
            // Generate TOTP secret on first login if not already generated
            if (user.getTotpSecret() == null) {
                user.setTotpSecret(totpUtil.generateSecret());
                adminUserRepository.save(user);
            }
            String qrCodeUri = totpUtil.getOtpAuthUri(user.getTotpSecret(), username, "Briva Diena Admin");
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("mfaSetupRequired", true);
            response.put("preToken", preToken);
            response.put("secret", user.getTotpSecret());
            response.put("qrCodeUri", qrCodeUri);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(Map.of(
                "mfaRequired", true,
                "preToken", preToken
        ));
    }

    /**
     * Step 2 — verify TOTP code and exchange pre-auth token for a full access token.
     * Also activates MFA on the account if this is the first-time setup.
     */
    @PostMapping("/login/verify-mfa")
    public ResponseEntity<?> verifyMfa(@RequestBody Map<String, String> body) {
        String preToken = body.get("preToken");
        String code = body.get("code");

        if (preToken == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "preToken and code required"));
        }

        Claims claims;
        try {
            claims = jwtUtil.validateToken(preToken);
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token expired or invalid — please log in again"));
        }

        if (!jwtUtil.isPreAuthToken(claims)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token type"));
        }

        String username = claims.getSubject();
        Optional<AdminUser> userOpt = adminUserRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AdminUser user = userOpt.get();
        if (!totpUtil.verify(user.getTotpSecret(), code)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid MFA code"));
        }

        // Activate MFA after the user successfully scans and verifies the QR code
        if (!user.isMfaEnabled()) {
            user.setMfaEnabled(true);
            adminUserRepository.save(user);
        }

        String accessToken = jwtUtil.generateAccessToken(username);
        return ResponseEntity.ok(Map.of(
                "token", accessToken,
                "expiresIn", jwtUtil.getAccessTokenExpirySeconds()
        ));
    }

    /** Stateless logout — client discards the token. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    /** Returns basic info about the currently authenticated admin. */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return adminUserRepository.findByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "mfaEnabled", user.isMfaEnabled()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
