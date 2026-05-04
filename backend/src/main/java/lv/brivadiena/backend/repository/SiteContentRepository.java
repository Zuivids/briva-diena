package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteContentRepository extends JpaRepository<SiteContent, String> {
}
