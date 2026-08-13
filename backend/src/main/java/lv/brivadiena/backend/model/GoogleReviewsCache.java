package lv.brivadiena.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "google_reviews_cache")
public class GoogleReviewsCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "overall_rating")
    private Double overallRating;

    @Column(name = "total_rating_count")
    private Integer totalRatingCount;

    @Column(name = "reviews_json", nullable = false, columnDefinition = "TEXT")
    private String reviewsJson = "[]";

    @Column(name = "place_url", length = 1024)
    private String placeUrl;

    @Column(name = "last_fetched_at")
    private LocalDateTime lastFetchedAt;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    public Long getId() {
        return id;
    }

    public Double getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Double overallRating) {
        this.overallRating = overallRating;
    }

    public Integer getTotalRatingCount() {
        return totalRatingCount;
    }

    public void setTotalRatingCount(Integer totalRatingCount) {
        this.totalRatingCount = totalRatingCount;
    }

    public String getReviewsJson() {
        return reviewsJson;
    }

    public void setReviewsJson(String reviewsJson) {
        this.reviewsJson = reviewsJson;
    }

    public String getPlaceUrl() {
        return placeUrl;
    }

    public void setPlaceUrl(String placeUrl) {
        this.placeUrl = placeUrl;
    }

    public LocalDateTime getLastFetchedAt() {
        return lastFetchedAt;
    }

    public void setLastFetchedAt(LocalDateTime lastFetchedAt) {
        this.lastFetchedAt = lastFetchedAt;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }
}
