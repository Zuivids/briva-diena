package lv.brivadiena.backend.repository;

import lv.brivadiena.backend.model.NewsletterSignup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsletterSignupRepository extends JpaRepository<NewsletterSignup, Long> {
    List<NewsletterSignup> findAllByOrderByCreatedAtDesc();

    Optional<NewsletterSignup> findByEmail(String email);
}
