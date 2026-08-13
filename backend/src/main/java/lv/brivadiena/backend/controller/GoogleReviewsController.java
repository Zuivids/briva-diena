package lv.brivadiena.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lv.brivadiena.backend.model.GoogleReviewsCache;
import lv.brivadiena.backend.service.GoogleReviewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/google-reviews")
public class GoogleReviewsController {

    @Autowired
    private GoogleReviewsService googleReviewsService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Map<String, Object> toMap(GoogleReviewsCache cache) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("configured", googleReviewsService.isConfigured());
        m.put("fullReviewsConfigured", googleReviewsService.isFullReviewsConfigured());
        m.put("overallRating", cache.getOverallRating());
        m.put("totalRatingCount", cache.getTotalRatingCount());
        m.put("placeUrl", cache.getPlaceUrl());
        m.put("lastFetchedAt", cache.getLastFetchedAt());
        m.put("lastError", cache.getLastError());
        try {
            m.put("reviews", objectMapper.readValue(cache.getReviewsJson(), List.class));
        } catch (Exception e) {
            m.put("reviews", List.of());
        }
        return m;
    }

    /**
     * GET /api/google-reviews - Cached Google reviews for the landing page (public)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getReviews() {
        return ResponseEntity.ok(toMap(googleReviewsService.getOrCreateCache()));
    }

    /**
     * POST /api/google-reviews/refresh - Re-fetch reviews from Google Places API (admin)
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh() {
        return ResponseEntity.ok(toMap(googleReviewsService.refresh()));
    }
}
