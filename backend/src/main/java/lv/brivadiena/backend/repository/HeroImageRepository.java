package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.HeroImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HeroImageRepository extends JpaRepository<HeroImage, Long> {
}
