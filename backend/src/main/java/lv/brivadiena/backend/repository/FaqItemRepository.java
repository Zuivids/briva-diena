package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.FaqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqItemRepository extends JpaRepository<FaqItem, Long> {
    List<FaqItem> findAllByOrderBySortOrderAscIdAsc();
}
