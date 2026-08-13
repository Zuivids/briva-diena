package lv.brivadiena.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lv.brivadiena.backend.model.GoogleReviewsCache;
import lv.brivadiena.backend.repository.GoogleReviewsCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleReviewsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleReviewsService.class);
    private static final String PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";
    private static final String OUTSCRAPER_REVIEWS_URL = "https://api.app.outscraper.com/maps/reviews-v3";

    @Autowired
    private GoogleReviewsCacheRepository repository;

    @Value("${app.google-places-api-key:}")
    private String apiKey;

    @Value("${app.google-places-place-id:}")
    private String placeId;

    @Value("${app.outscraper-api-key:}")
    private String outscraperApiKey;

    @Value("${app.outscraper-query:}")
    private String outscraperQuery;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.create();

    public GoogleReviewsCache getOrCreateCache() {
        return repository.findAll().stream()
                .findFirst()
                .orElseGet(() -> repository.save(new GoogleReviewsCache()));
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && placeId != null && !placeId.isBlank();
    }

    public boolean isFullReviewsConfigured() {
        return outscraperApiKey != null && !outscraperApiKey.isBlank()
                && outscraperQuery != null && !outscraperQuery.isBlank();
    }

    public GoogleReviewsCache refresh() {
        GoogleReviewsCache cache = getOrCreateCache();

        if (!isConfigured()) {
            cache.setLastError("Google Places API nav konfigurēts (trūkst API atslēgas vai Place ID).");
            cache.setLastFetchedAt(LocalDateTime.now());
            return repository.save(cache);
        }

        try {
            String response = restClient.get()
                    .uri(PLACE_DETAILS_URL + "?place_id={placeId}&fields=rating,user_ratings_total,reviews,url&language=lv&key={apiKey}",
                            placeId, apiKey)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String status = root.path("status").asText("");
            if (!"OK".equals(status)) {
                String errorMessage = root.path("error_message").asText(status);
                cache.setLastError("Google Places API kļūda: " + errorMessage);
                cache.setLastFetchedAt(LocalDateTime.now());
                return repository.save(cache);
            }

            JsonNode result = root.path("result");
            cache.setOverallRating(result.hasNonNull("rating") ? result.get("rating").asDouble() : null);
            cache.setTotalRatingCount(result.hasNonNull("user_ratings_total") ? result.get("user_ratings_total").asInt() : null);
            cache.setPlaceUrl(result.hasNonNull("url") ? result.get("url").asText() : null);

            List<ObjectNode> reviews = new ArrayList<>();
            for (JsonNode r : result.path("reviews")) {
                ObjectNode review = objectMapper.createObjectNode();
                review.put("authorName", r.path("author_name").asText(""));
                review.put("authorPhotoUrl", r.hasNonNull("profile_photo_url") ? r.get("profile_photo_url").asText() : null);
                review.put("rating", r.path("rating").asInt(5));
                review.put("relativeTimeDescription", r.path("relative_time_description").asText(""));
                review.put("text", r.path("text").asText(""));
                review.put("time", r.path("time").asLong(0));
                reviews.add(review);
            }
            List<ObjectNode> fullReviews = fetchOutscraperReviews();
            cache.setReviewsJson(objectMapper.writeValueAsString(fullReviews != null && !fullReviews.isEmpty() ? fullReviews : reviews));
            cache.setLastError(null);
            cache.setLastFetchedAt(LocalDateTime.now());
        } catch (Exception e) {
            log.warn("Failed to refresh Google reviews", e);
            cache.setLastError("Neizdevās ielādēt atsauksmes: " + e.getMessage());
            cache.setLastFetchedAt(LocalDateTime.now());
        }

        return repository.save(cache);
    }

    /**
     * Fetches the full review list (not capped at 5) via Outscraper, which scrapes Google Maps directly.
     * Returns null if not configured or the call fails — refresh() falls back to the 5 reviews from the
     * official Places API in that case, so this is a pure enhancement, never a hard requirement.
     */
    private List<ObjectNode> fetchOutscraperReviews() {
        if (!isFullReviewsConfigured()) {
            return null;
        }
        try {
            String response = restClient.get()
                    .uri(OUTSCRAPER_REVIEWS_URL + "?query={query}&reviewsLimit=100&sort=newest&async=false",
                            outscraperQuery)
                    .header("X-API-KEY", outscraperApiKey)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode dataArray = root.isArray() ? root : root.path("data");
            if (!dataArray.isArray() || dataArray.isEmpty()) {
                return null;
            }
            JsonNode reviewsData = dataArray.get(0).path("reviews_data");
            if (!reviewsData.isArray() || reviewsData.isEmpty()) {
                return null;
            }

            List<ObjectNode> reviews = new ArrayList<>();
            for (JsonNode r : reviewsData) {
                ObjectNode review = objectMapper.createObjectNode();
                review.put("authorName", firstText(r, "", "author_title", "author_name"));
                String photo = firstTextOrNull(r, "author_image", "author_photo_url");
                if (photo != null) {
                    review.put("authorPhotoUrl", photo);
                } else {
                    review.putNull("authorPhotoUrl");
                }
                review.put("rating", firstInt(r, 5, "review_rating", "rating"));
                review.put("relativeTimeDescription", firstText(r, "", "review_datetime_utc", "review_time", "review_date"));
                review.put("text", firstText(r, "", "review_text", "text"));
                review.put("time", firstLong(r, 0, "review_timestamp", "time"));
                reviews.add(review);
            }
            return reviews;
        } catch (Exception e) {
            log.warn("Failed to fetch full review list from Outscraper", e);
            return null;
        }
    }

    private String firstText(JsonNode node, String fallback, String... keys) {
        for (String key : keys) {
            if (node.hasNonNull(key)) {
                return node.get(key).asText();
            }
        }
        return fallback;
    }

    private String firstTextOrNull(JsonNode node, String... keys) {
        for (String key : keys) {
            if (node.hasNonNull(key)) {
                return node.get(key).asText();
            }
        }
        return null;
    }

    private int firstInt(JsonNode node, int fallback, String... keys) {
        for (String key : keys) {
            if (node.hasNonNull(key)) {
                return node.get(key).asInt(fallback);
            }
        }
        return fallback;
    }

    private long firstLong(JsonNode node, long fallback, String... keys) {
        for (String key : keys) {
            if (node.hasNonNull(key)) {
                return node.get(key).asLong(fallback);
            }
        }
        return fallback;
    }
}
