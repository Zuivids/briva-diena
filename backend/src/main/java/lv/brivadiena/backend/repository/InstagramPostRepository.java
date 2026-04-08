package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.InstagramPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstagramPostRepository extends JpaRepository<InstagramPost, Long> {
    List<InstagramPost> findAllByOrderBySortOrderAscCreatedAtAsc();
}
