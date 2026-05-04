package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.SiteContent;
import lv.brivadiena.backend.repository.SiteContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/site-content")
public class SiteContentController {

    @Autowired
    private SiteContentRepository siteContentRepository;

    /**
     * GET /api/site-content/{key} — returns { key, value } for the given key.
     * Public endpoint — readable without authentication.
     */
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, String>> getContent(@PathVariable String key) {
        return siteContentRepository.findById(key)
                .map(sc -> ResponseEntity.ok(Map.of("key", sc.getKeyName(), "value", sc.getValue())))
                .orElse(ResponseEntity.ok(Map.of("key", key, "value", "")));
    }

    /**
     * PUT /api/site-content/{key} — saves { value } for the given key.
     * Admin-only endpoint (JWT required).
     */
    @PutMapping("/{key}")
    public ResponseEntity<Map<String, String>> saveContent(@PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.getOrDefault("value", "");
        SiteContent sc = siteContentRepository.findById(key)
                .orElse(new SiteContent(key, value));
        sc.setValue(value);
        siteContentRepository.save(sc);
        return ResponseEntity.ok(Map.of("key", sc.getKeyName(), "value", sc.getValue()));
    }
}
