package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.Trip;
import lv.brivadiena.backend.model.TripImage;
import lv.brivadiena.backend.repository.TripImageRepository;
import lv.brivadiena.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.PatchMapping;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripImageRepository tripImageRepository;

    @Value("${app.images-path}")
    private String imagesPath;

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
     * GET /api/trips/landing?section=TOP|LAST_CHANCE - Get trips for landing page
     * sections
     */
    @GetMapping("/landing")
    public ResponseEntity<List<Trip>> getLandingTrips(@RequestParam String section) {
        List<Trip> trips = tripRepository.findByLandingSectionOrderByStartDate(section);
        return ResponseEntity.ok(trips.stream().limit(3).toList());
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
            trip.setLandingSection(tripDetails.getLandingSection());
            trip.setTransportationType(tripDetails.getTransportationType());
            trip.setAccommodation(tripDetails.getAccommodation());
            trip.setAirlineCompany(tripDetails.getAirlineCompany());
            trip.setIncludedBaggageSize(tripDetails.getIncludedBaggageSize());
            trip.setGroupSize(tripDetails.getGroupSize());
            trip.setPriceIncluded(tripDetails.getPriceIncluded());
            trip.setExtraCharge(tripDetails.getExtraCharge());
            trip.setItineraryJson(tripDetails.getItineraryJson());
            trip.setFlightScheduleJson(tripDetails.getFlightScheduleJson());
            trip.setPaymentInfo(tripDetails.getPaymentInfo());
            trip.setTripDurationDays(tripDetails.getTripDurationDays());
            if (tripDetails.getHidden() != null) {
                trip.setHidden(tripDetails.getHidden());
            }
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

    /**
     * PATCH /api/trips/{id}/hidden - Toggle trip visibility (admin)
     */
    @PatchMapping("/{id}/hidden")
    public ResponseEntity<Trip> setTripHidden(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Optional<Trip> opt = tripRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        Trip trip = opt.get();
        trip.setHidden(body.getOrDefault("hidden", false));
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    /**
     * GET /api/trips/{id}/images - List images for a trip
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<?> getTripImages(@PathVariable Long id) {
        if (!tripRepository.existsById(id))
            return ResponseEntity.notFound().build();
        var images = tripImageRepository.findByTripIdOrderBySortOrder(id);
        var result = images.stream().map(img -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", img.getId());
            m.put("path", img.getPath());
            m.put("isCover", Boolean.TRUE.equals(img.getIsBackground()));
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/trips/{id}/images - Upload an image for a trip
     */
    @PostMapping("/{id}/images")
    public ResponseEntity<?> uploadTripImage(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        var opt = tripRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(imagesPath).resolve(filename);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toFile());
            TripImage img = new TripImage(opt.get(), filename, false, 0);
            tripImageRepository.save(img);
            Map<String, Object> result = new HashMap<>();
            result.put("id", img.getId());
            result.put("path", filename);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
        }
    }

    /**
     * PUT /api/trips/{id}/images/{imageId}/cover - Set image as cover
     */
    @PutMapping("/{id}/images/{imageId}/cover")
    public ResponseEntity<?> setCoverImage(@PathVariable Long id, @PathVariable Long imageId) {
        if (!tripRepository.existsById(id))
            return ResponseEntity.notFound().build();
        // Clear existing cover
        tripImageRepository.findByTripIdAndIsBackground(id, true).ifPresent(existing -> {
            existing.setIsBackground(false);
            tripImageRepository.save(existing);
        });
        // Set new cover
        var opt = tripImageRepository.findById(imageId);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        opt.get().setIsBackground(true);
        tripImageRepository.save(opt.get());
        Map<String, Object> result = new HashMap<>();
        result.put("id", opt.get().getId());
        result.put("path", opt.get().getPath());
        result.put("isCover", true);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/trips/{id}/cover - Get cover image path
     */
    @GetMapping("/{id}/cover")
    public ResponseEntity<?> getCoverImage(@PathVariable Long id) {
        var opt = tripImageRepository.findByTripIdAndIsBackground(id, true);
        if (opt.isEmpty())
            return ResponseEntity.noContent().build();
        Map<String, Object> result = new HashMap<>();
        result.put("id", opt.get().getId());
        result.put("path", opt.get().getPath());
        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/trips/{id}/images/{imageId} - Delete a trip image
     */
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteTripImage(@PathVariable Long id, @PathVariable Long imageId) {
        var opt = tripImageRepository.findById(imageId);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        try {
            Files.deleteIfExists(Paths.get(imagesPath).resolve(opt.get().getPath()));
        } catch (Exception ignored) {
        }
        tripImageRepository.deleteById(imageId);
        return ResponseEntity.noContent().build();
    }
}
