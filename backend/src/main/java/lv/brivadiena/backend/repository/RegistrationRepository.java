package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.Registration;
import lv.brivadiena.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByTrip(Trip trip);

    List<Registration> findByStatus(String status);

    @Query("SELECT r FROM Registration r LEFT JOIN FETCH r.trip")
    List<Registration> findAllWithTrip();

    @Query("SELECT r FROM Registration r LEFT JOIN FETCH r.trip WHERE r.id = :id")
    java.util.Optional<Registration> findByIdWithTrip(Long id);

    @Query("SELECT r FROM Registration r LEFT JOIN FETCH r.trip WHERE r.trip = :trip")
    List<Registration> findByTripWithTrip(Trip trip);
}
