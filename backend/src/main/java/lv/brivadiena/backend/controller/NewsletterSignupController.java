package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.NewsletterSignup;
import lv.brivadiena.backend.repository.NewsletterSignupRepository;
import lv.brivadiena.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/newsletter-signups")
public class NewsletterSignupController {

    @Autowired
    private NewsletterSignupRepository newsletterSignupRepository;

    @Autowired
    private EmailService emailService;

    /**
     * POST /api/newsletter-signups - public: register interest in future trips.
     * Idempotent — resubmitting the same email updates its selected topic instead of duplicating.
     */
    @PostMapping
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank() || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email"));
        }
        String topic = body.get("topic");
        if (topic == null || topic.isBlank()) {
            topic = "Visi";
        }
        topic = topic.trim();
        if (topic.length() > 255) {
            topic = topic.substring(0, 255);
        }

        Optional<NewsletterSignup> existing = newsletterSignupRepository.findByEmail(email.trim());
        if (existing.isPresent()) {
            NewsletterSignup signup = existing.get();
            signup.setTopic(topic);
            newsletterSignupRepository.save(signup);
        } else {
            newsletterSignupRepository.save(new NewsletterSignup(email.trim(), topic));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true));
    }

    /**
     * GET /api/newsletter-signups - admin only: list all collected emails.
     */
    @GetMapping
    public ResponseEntity<List<NewsletterSignup>> getAll() {
        return ResponseEntity.ok(newsletterSignupRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * POST /api/newsletter-signups/send-email - admin only: broadcast a message
     * to the given subset of subscribers (BCC'd, sent from brivadiena@gmail.com).
     * Recipients are cross-checked against stored signups so this can only reach
     * addresses that actually exist in the table.
     */
    @PostMapping("/send-email")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> sendBroadcast(@RequestBody Map<String, Object> body) {
        Object emailsObj = body.get("emails");
        String message = (String) body.get("message");

        if (!(emailsObj instanceof List) || ((List<?>) emailsObj).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No recipients selected"));
        }
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        Set<String> requested = ((List<String>) emailsObj).stream()
                .filter(e -> e != null && !e.isBlank())
                .collect(Collectors.toSet());

        List<String> validRecipients = newsletterSignupRepository.findAll().stream()
                .map(NewsletterSignup::getEmail)
                .filter(requested::contains)
                .toList();

        if (validRecipients.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No matching subscribers found"));
        }

        try {
            emailService.sendBroadcastEmail(validRecipients, message);
            return ResponseEntity.ok(Map.of("success", true, "sentCount", validRecipients.size()));
        } catch (IllegalStateException notConfigured) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", notConfigured.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send: " + e.getMessage()));
        }
    }
}
