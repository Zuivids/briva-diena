package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.AboutPageImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AboutPageImageRepository extends JpaRepository<AboutPageImage, Long> {
    Optional<AboutPageImage> findBySlotIndex(Integer slotIndex);
}
