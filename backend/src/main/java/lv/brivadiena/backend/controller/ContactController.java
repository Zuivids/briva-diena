package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submitContact(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String phone = body.get("phone");
        String message = body.get("message");

        if (email == null || email.isBlank() || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return ResponseEntity.badRequest().body("Invalid email");
        }
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body("Message is required");
        }
        if (name != null && name.length() > 100) {
            return ResponseEntity.badRequest().body("Name too long");
        }
        if (message.length() > 2000) {
            return ResponseEntity.badRequest().body("Message too long");
        }

        try {
            emailService.sendContactEmail(name, email, phone, message);
            log.info("Contact form submitted from {}", email);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Failed to send contact email from {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to send message");
        }
    }
}
