package lv.brivadiena.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trip_images")
public class TripImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(length = 1024)
    private String path;

    @Column(name = "is_background")
    private Boolean isBackground = false;

    @Column(name = "sort_order")
    private Integer sortOrder;

    // Constructors
    public TripImage() {
    }

    public TripImage(Trip trip, String path, Boolean isBackground, Integer sortOrder) {
        this.trip = trip;
        this.path = path;
        this.isBackground = isBackground;
        this.sortOrder = sortOrder;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Boolean getIsBackground() {
        return isBackground;
    }

    public void setIsBackground(Boolean isBackground) {
        this.isBackground = isBackground;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
