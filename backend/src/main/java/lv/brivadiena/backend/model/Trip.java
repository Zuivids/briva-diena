package lv.brivadiena.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Long priceCents;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private Integer availableSpots;

    @Column(length = 20)
    private String landingSection;

    @Column(length = 100)
    private String transportationType;

    @Column(length = 255)
    private String accommodation;

    @Column(length = 100)
    private String airlineCompany;

    @Column(length = 100)
    private String includedBaggageSize;

    @Column
    private Integer groupSize;

    @Column(columnDefinition = "TEXT")
    private String priceIncluded;

    @Column(columnDefinition = "TEXT")
    private String extraCharge;

    @Column(columnDefinition = "TEXT")
    private String itineraryJson;

    @Column
    private Integer tripDurationDays;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripImage> images;

    @JsonIgnore
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Trip() {
    }

    public Trip(String name, String description, LocalDate startDate, LocalDate endDate,
            Long priceCents, String currency, Integer availableSpots) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.priceCents = priceCents;
        this.currency = currency;
        this.availableSpots = availableSpots;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getPriceCents() {
        return priceCents;
    }

    public void setPriceCents(Long priceCents) {
        this.priceCents = priceCents;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Integer getAvailableSpots() {
        return availableSpots;
    }

    public void setAvailableSpots(Integer availableSpots) {
        this.availableSpots = availableSpots;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<TripImage> getImages() {
        return images;
    }

    public void setImages(List<TripImage> images) {
        this.images = images;
    }

    public List<Registration> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(List<Registration> registrations) {
        this.registrations = registrations;
    }

    public String getLandingSection() {
        return landingSection;
    }

    public void setLandingSection(String landingSection) {
        this.landingSection = landingSection;
    }

    public String getTransportationType() {
        return transportationType;
    }

    public void setTransportationType(String transportationType) {
        this.transportationType = transportationType;
    }

    public String getAccommodation() {
        return accommodation;
    }

    public void setAccommodation(String accommodation) {
        this.accommodation = accommodation;
    }

    public String getAirlineCompany() {
        return airlineCompany;
    }

    public void setAirlineCompany(String airlineCompany) {
        this.airlineCompany = airlineCompany;
    }

    public String getIncludedBaggageSize() {
        return includedBaggageSize;
    }

    public void setIncludedBaggageSize(String includedBaggageSize) {
        this.includedBaggageSize = includedBaggageSize;
    }

    public Integer getGroupSize() {
        return groupSize;
    }

    public void setGroupSize(Integer groupSize) {
        this.groupSize = groupSize;
    }

    public String getPriceIncluded() {
        return priceIncluded;
    }

    public void setPriceIncluded(String priceIncluded) {
        this.priceIncluded = priceIncluded;
    }

    public String getExtraCharge() {
        return extraCharge;
    }

    public void setExtraCharge(String extraCharge) {
        this.extraCharge = extraCharge;
    }

    public String getItineraryJson() {
        return itineraryJson;
    }

    public void setItineraryJson(String itineraryJson) {
        this.itineraryJson = itineraryJson;
    }

    public Integer getTripDurationDays() {
        return tripDurationDays;
    }

    public void setTripDurationDays(Integer tripDurationDays) {
        this.tripDurationDays = tripDurationDays;
    }
}
