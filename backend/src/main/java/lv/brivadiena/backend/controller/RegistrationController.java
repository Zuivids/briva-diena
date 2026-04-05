package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.Registration;
import lv.brivadiena.backend.model.Trip;
import lv.brivadiena.backend.repository.RegistrationRepository;
import lv.brivadiena.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private TripRepository tripRepository;

    /**
     * GET /api/registrations - List all registrations (admin)
     */
    @GetMapping
    public ResponseEntity<List<Registration>> getAllRegistrations() {
        List<Registration> registrations = registrationRepository.findAll();
        return ResponseEntity.ok(registrations);
    }

    /**
     * GET /api/registrations/{id} - Get registration by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Registration> getRegistrationById(@PathVariable Long id) {
        Optional<Registration> registration = registrationRepository.findById(id);
        return registration.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/registrations/trip/{tripId} - Get all registrations for a trip (admin)
     */
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Registration>> getRegistrationsByTrip(@PathVariable Long tripId) {
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Registration> registrations = registrationRepository.findByTrip(trip.get());
            return ResponseEntity.ok(registrations);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * POST /api/registrations - Create a new registration (customer booking)
     */
    @PostMapping
    public ResponseEntity<Registration> createRegistration(@RequestBody Registration registration) {
        // Validate trip exists
        if (registration.getTrip() == null || registration.getTrip().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Trip> trip = tripRepository.findById(registration.getTrip().getId());
        if (trip.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Check available spots
        if (trip.get().getAvailableSpots() <= 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // No spots available
        }

        // Save registration
        Registration savedRegistration = registrationRepository.save(registration);

        // Decrement available spots
        Trip tripEntity = trip.get();
        tripEntity.setAvailableSpots(tripEntity.getAvailableSpots() - 1);
        tripRepository.save(tripEntity);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRegistration);
    }

    /**
     * PUT /api/registrations/{id} - Update registration status (admin)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Registration> updateRegistrationStatus(
            @PathVariable Long id,
            @RequestBody Registration registrationDetails) {
        Optional<Registration> optionalRegistration = registrationRepository.findById(id);
        if (optionalRegistration.isPresent()) {
            Registration registration = optionalRegistration.get();
            registration.setStatus(registrationDetails.getStatus());
            Registration updatedRegistration = registrationRepository.save(registration);
            return ResponseEntity.ok(updatedRegistration);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * DELETE /api/registrations/{id} - Cancel registration
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        Optional<Registration> optionalRegistration = registrationRepository.findById(id);
        if (optionalRegistration.isPresent()) {
            Registration registration = optionalRegistration.get();
            
            // Restore available spots if registration was confirmed
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
