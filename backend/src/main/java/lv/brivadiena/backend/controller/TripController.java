package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.Trip;
import lv.brivadiena.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    /**
     * GET /api/trips - List all trips
     */
    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        return ResponseEntity.ok(trips);
    }

    /**
     * GET /api/trips/available - List all trips with available spots
     */
    @GetMapping("/available")
    public ResponseEntity<List<Trip>> getAvailableTrips() {
        List<Trip> trips = tripRepository.findAllWithAvailableSpots();
        return ResponseEntity.ok(trips);
    }

    /**
     * GET /api/trips/upcoming - Get upcoming trips ordered by start date (for
     * landing page)
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<Trip>> getUpcomingTrips(
            @RequestParam(defaultValue = "4") int limit) {
        List<Trip> trips = tripRepository.findByStartDateGreaterThanEqualOrderByStartDate(LocalDate.now());
        return ResponseEntity.ok(trips.stream().limit(limit).toList());
    }

    /**
     * GET /api/trips/{id} - Get trip details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        Optional<Trip> trip = tripRepository.findById(id);
        return trip.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/trips/filter/month - Filter trips by month
     */
    @GetMapping("/filter/month")
    public ResponseEntity<List<Trip>> getTripsByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        List<Trip> trips = tripRepository.findByMonth(year, month);
        return ResponseEntity.ok(trips);
    }

    /**
     * GET /api/trips/filter/duration - Filter trips by duration in days
     */
    @GetMapping("/filter/duration")
    public ResponseEntity<List<Trip>> getTripsByDuration(
            @RequestParam int days) {
        List<Trip> trips = tripRepository.findByDuration(days);
        return ResponseEntity.ok(trips);
    }

    /**
     * GET /api/trips/filter/price - Filter trips by price range
     */
    @GetMapping("/filter/price")
    public ResponseEntity<List<Trip>> getTripsByPriceRange(
            @RequestParam Long minPrice,
            @RequestParam Long maxPrice) {
        List<Trip> trips = tripRepository.findByPriceCentsBetweenOrderByStartDate(minPrice, maxPrice);
        return ResponseEntity.ok(trips);
    }

    /**
     * POST /api/trips - Create a new trip (admin)
     */
    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        Trip savedTrip = tripRepository.save(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrip);
    }

    /**
     * PUT /api/trips/{id} - Update a trip (admin)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @RequestBody Trip tripDetails) {
        Optional<Trip> optionalTrip = tripRepository.findById(id);
        if (optionalTrip.isPresent()) {
            Trip trip = optionalTrip.get();
            trip.setName(tripDetails.getName());
            trip.setDescription(tripDetails.getDescription());
            trip.setStartDate(tripDetails.getStartDate());
            trip.setEndDate(tripDetails.getEndDate());
            trip.setPriceCents(tripDetails.getPriceCents());
            trip.setCurrency(tripDetails.getCurrency());
            trip.setAvailableSpots(tripDetails.getAvailableSpots());
            Trip updatedTrip = tripRepository.save(trip);
            return ResponseEntity.ok(updatedTrip);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * DELETE /api/trips/{id} - Delete a trip (admin)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
