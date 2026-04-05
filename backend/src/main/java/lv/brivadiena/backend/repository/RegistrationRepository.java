package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.Registration;
import lv.brivadiena.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByTrip(Trip trip);

    List<Registration> findByStatus(String status);
}
