package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.Registration;
import lv.brivadiena.backend.model.Trip;
import lv.brivadiena.backend.repository.RegistrationRepository;
import lv.brivadiena.backend.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private static final Logger log = LoggerFactory.getLogger(RegistrationController.class);

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRegistrations() {
        List<Map<String, Object>> result = registrationRepository.findAllWithTrip().stream()
                .map(this::toMap)
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRegistrationById(@PathVariable Long id) {
        return registrationRepository.findByIdWithTrip(id)
                .map(r -> ResponseEntity.ok(toMap(r)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(Registration r) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("firstName", r.getFirstName());
        m.put("lastName", r.getLastName());
        m.put("phone", r.getPhone());
        m.put("email", r.getEmail());
        m.put("personalIdNumber", r.getPersonalIdNumber());
        m.put("passportNumber", r.getPassportNumber());
        m.put("passportExpirationDate", r.getPassportExpirationDate());
        m.put("status", r.getStatus());
        m.put("createdAt", r.getCreatedAt());
        if (r.getTrip() != null) {
            m.put("trip", Map.of("id", r.getTrip().getId(), "name", r.getTrip().getName()));
        }
        return m;
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Map<String, Object>>> getRegistrationsByTrip(@PathVariable Long tripId) {
        return tripRepository.findById(tripId)
                .map(trip -> ResponseEntity.ok(
                        registrationRepository.findByTripWithTrip(trip).stream().map(this::toMap).toList()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * POST /api/registrations
     * Accepts a flat JSON body with tripId as a string to match the frontend model.
     */
    @PostMapping
    public ResponseEntity<?> createRegistration(@RequestBody Map<String, Object> body) {
        log.info("Received registration request for tripId={}", body.get("tripId"));
        try {
            // --- Input validation ---
            Object tripIdRaw = body.get("tripId");
            if (tripIdRaw == null) {
                return ResponseEntity.badRequest().body("Missing tripId");
            }

            String firstName = getString(body, "firstName");
            String lastName  = getString(body, "lastName");
            String phone     = getString(body, "phone");
            String email     = getString(body, "email");

            if (firstName == null || firstName.isBlank()) return ResponseEntity.badRequest().body("Missing firstName");
            if (lastName  == null || lastName.isBlank())  return ResponseEntity.badRequest().body("Missing lastName");
            if (phone     == null || phone.isBlank())     return ResponseEntity.badRequest().body("Missing phone");
            if (email     == null || email.isBlank())     return ResponseEntity.badRequest().body("Missing email");

            if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
                return ResponseEntity.badRequest().body("Invalid email address");
            }
            if (firstName.length() > 100 || lastName.length() > 100) {
                return ResponseEntity.badRequest().body("Name too long");
            }
            if (phone.length() > 20) {
                return ResponseEntity.badRequest().body("Phone number too long");
            }

            Long tripId = Long.parseLong(tripIdRaw.toString());
            Optional<Trip> tripOpt = tripRepository.findById(tripId);
            if (tripOpt.isEmpty()) {
                log.warn("Registration rejected: trip {} not found", tripId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found");
            }

            Trip trip = tripOpt.get();
            if (trip.getAvailableSpots() <= 0) {
                log.warn("Registration rejected: no spots left for trip {}", tripId);
                return ResponseEntity.status(HttpStatus.CONFLICT).body("No available spots");
            }

            Registration reg = new Registration();
            reg.setTrip(trip);
            reg.setFirstName(firstName);
            reg.setLastName(lastName);
            reg.setPhone(phone);
            reg.setEmail(email);
            reg.setPersonalIdNumber(getString(body, "personalId"));
            reg.setPassportNumber(getString(body, "passportNumber"));

            Object expiryRaw = body.get("passportExpiryDate");
            if (expiryRaw != null && !expiryRaw.toString().isBlank()) {
                // Accept both "yyyy-MM-dd" and full ISO datetime strings
                String dateStr = expiryRaw.toString().length() > 10
                        ? expiryRaw.toString().substring(0, 10)
                        : expiryRaw.toString();
                reg.setPassportExpirationDate(LocalDate.parse(dateStr));
            }

            Registration saved = registrationRepository.save(reg);
            trip.setAvailableSpots(trip.getAvailableSpots() - 1);
            tripRepository.save(trip);

            log.info("Registration {} saved for trip {}", saved.getId(), tripId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", saved.getId()));

        } catch (Exception e) {
            log.error("Error creating registration for tripId={}: {}", body.get("tripId"), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal error: " + e.getMessage());
        }
    }

    private String getString(Map<String, Object> body, String key) {
        Object val = body.get(key);
        return val instanceof String s ? s.strip() : null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRegistrationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return registrationRepository.findByIdWithTrip(id).map(reg -> {
            reg.setStatus(newStatus);
            Registration saved = registrationRepository.save(reg);
            log.info("Registration {} status updated to {}", id, newStatus);
            return ResponseEntity.ok(toMap(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        Optional<Registration> optionalRegistration = registrationRepository.findByIdWithTrip(id);
        if (optionalRegistration.isPresent()) {
            Registration registration = optionalRegistration.get();
            if ("CONFIRMED".equals(registration.getStatus()) || "PENDING".equals(registration.getStatus())) {
                Trip trip = registration.getTrip();
                trip.setAvailableSpots(trip.getAvailableSpots() + 1);
                tripRepository.save(trip);
            }

            registrationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
