package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.InstagramPost;
import lv.brivadiena.backend.repository.InstagramPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instagram-posts")
public class InstagramPostController {

    @Autowired
    private InstagramPostRepository instagramPostRepository;

    /**
     * GET /api/instagram-posts - list all posts ordered by sort_order
     */
    @GetMapping
    public ResponseEntity<List<InstagramPost>> getAll() {
        return ResponseEntity.ok(instagramPostRepository.findAllByOrderBySortOrderAscCreatedAtAsc());
    }

    /**
     * POST /api/instagram-posts - add a new post
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body("url is required");
        }
        long count = instagramPostRepository.count();
        if (count >= 5) {
            return ResponseEntity.badRequest().body("Maximum 5 posts allowed");
        }
        InstagramPost post = new InstagramPost();
        post.setUrl(url.trim());
        post.setSortOrder((int) count);
        return ResponseEntity.ok(instagramPostRepository.save(post));
    }

    /**
     * DELETE /api/instagram-posts/{id} - delete a post
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!instagramPostRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        instagramPostRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
