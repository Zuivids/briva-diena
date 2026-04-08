package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.TripImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripImageRepository extends JpaRepository<TripImage, Long> {
    List<TripImage> findByTripIdOrderBySortOrder(Long tripId);

    Optional<TripImage> findByTripIdAndIsBackground(Long tripId, Boolean isBackground);

    void deleteByTripId(Long tripId);
}
