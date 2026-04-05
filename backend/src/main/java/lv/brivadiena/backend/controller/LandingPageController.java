package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.Trip;
import lv.brivadiena.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LandingPageController {

    @Autowired
    private TripRepository tripRepository;

    /**
     * GET /api/landing-page - Get landing page data
     * Returns:
     * - upcomingTrips: 4 nearest available trips
     * - about: About "Free Day" section
     * - reviews: Reviews section (placeholder)
     * - faq: FAQ section (placeholder)
     */
    @GetMapping("/landing-page")
    public ResponseEntity<Map<String, Object>> getLandingPageData() {
        Map<String, Object> landingPageData = new HashMap<>();

        // Get 4 nearest upcoming trips with available spots
        List<Trip> upcomingTrips = tripRepository.findByStartDateGreaterThanEqualOrderByStartDate(LocalDate.now())
                .stream()
                .filter(trip -> trip.getAvailableSpots() > 0)
                .limit(4)
                .toList();

        landingPageData.put("upcomingTrips", upcomingTrips);

        // Placeholder data for other sections
        landingPageData.put("about", Map.of(
                "title", "What is a Free Day",
                "description", "Free Day is about exploring the world with freedom and flexibility. " +
                        "Join our curated trips to discover new places and cultures."));

        landingPageData.put("reviews", Map.of(
                "count", 0,
                "averageRating", 0.0,
                "items", List.of()));

        landingPageData.put("faq", Map.of(
                "items", List.of()));

        return ResponseEntity.ok(landingPageData);
    }

    /**
     * GET /api/trips-count - Get total number of trips
     */
    @GetMapping("/trips-count")
    public ResponseEntity<Map<String, Long>> getTripsCount() {
        Map<String, Long> data = new HashMap<>();
        data.put("count", tripRepository.count());
        return ResponseEntity.ok(data);
    }
}
