package lv.brivadiena.backend.config;

import lv.brivadiena.backend.model.AdminUser;
import lv.brivadiena.backend.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);
    private static final String CHARS = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin-initial-password:}")
    private String configuredPassword;

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return; // admin user already exists
        }

        String password = configuredPassword.isBlank() ? generatePassword(16) : configuredPassword;
        AdminUser admin = new AdminUser("admin", passwordEncoder.encode(password));
        adminUserRepository.save(admin);

        log.warn("╔══════════════════════════════════════════════════╗");
        log.warn("║  ADMIN ACCOUNT CREATED                           ║");
        log.warn("║  Username : admin                                ║");
        log.warn("║  Password : {}                      ║", password);
        log.warn("║  MFA will be required on first login.            ║");
        log.warn("╚══════════════════════════════════════════════════╝");
    }

    private String generatePassword(int length) {
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(rng.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
