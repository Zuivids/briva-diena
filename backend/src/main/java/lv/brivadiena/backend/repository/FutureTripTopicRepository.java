package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.FutureTripTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FutureTripTopicRepository extends JpaRepository<FutureTripTopic, Long> {
    List<FutureTripTopic> findAllByOrderBySortOrderAsc();
}
