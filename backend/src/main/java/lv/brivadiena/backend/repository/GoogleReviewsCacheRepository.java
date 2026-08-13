package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.GoogleReviewsCache;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleReviewsCacheRepository extends JpaRepository<GoogleReviewsCache, Long> {
}
