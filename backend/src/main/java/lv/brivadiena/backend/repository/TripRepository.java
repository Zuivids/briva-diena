package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    /**
     * Find trips that start on or after the given date, ordered by start date
     * (nearest first)
     */
    List<Trip> findByStartDateGreaterThanEqualOrderByStartDate(LocalDate startDate);

    /**
     * Find trips within a date range
     */
    List<Trip> findByStartDateGreaterThanEqualAndEndDateLessThanEqualOrderByStartDate(LocalDate startDate,
            LocalDate endDate);

    /**
     * Find trips by price range
     */
    List<Trip> findByPriceCentsBetweenOrderByStartDate(Long minPrice, Long maxPrice);

    /**
     * Find trips by number of days (duration)
     */
    @Query("SELECT t FROM Trip t WHERE DATEDIFF(t.endDate, t.startDate) = :days ORDER BY t.startDate ASC")
    List<Trip> findByDuration(@Param("days") int days);

    /**
     * Find trips that start in a specific month/year
     */
    @Query("SELECT t FROM Trip t WHERE YEAR(t.startDate) = :year AND MONTH(t.startDate) = :month ORDER BY t.startDate ASC")
    List<Trip> findByMonth(@Param("year") int year, @Param("month") int month);

    /**
     * Find trips with available spots (excluding hidden)
     */
    @Query("SELECT t FROM Trip t WHERE t.availableSpots > 0 AND t.hidden = false ORDER BY t.startDate ASC")
    List<Trip> findAllWithAvailableSpots();

    /**
     * Find trips by landing section (TOP or LAST_CHANCE), excluding hidden
     */
    @Query("SELECT t FROM Trip t WHERE t.landingSection = :section AND t.hidden = false ORDER BY t.startDate ASC")
    List<Trip> findByLandingSectionOrderByStartDate(@Param("section") String section);

    /**
     * Find upcoming trips ordered by start date, excluding hidden
     */
    @Query("SELECT t FROM Trip t WHERE t.startDate >= :date AND t.hidden = false ORDER BY t.startDate ASC")
    List<Trip> findByStartDateGreaterThanEqualOrderByStartDate(@Param("date") LocalDate date);
}
