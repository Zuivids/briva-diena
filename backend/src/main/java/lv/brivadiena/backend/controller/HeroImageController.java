package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.HeroImage;
import lv.brivadiena.backend.repository.HeroImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hero-image")
public class HeroImageController {

    @Autowired
    private HeroImageRepository heroImageRepository;

    @Value("${app.images-path:./images}")
    private String imagesPath;

    /**
     * GET /api/hero-image — returns the stored hero image path, or empty if none
     * set.
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getHeroImage() {
        return heroImageRepository.findAll().stream()
                .findFirst()
                .map(img -> ResponseEntity.ok(Map.of("path", img.getPath())))
                .orElse(ResponseEntity.ok(Map.of("path", "")));
    }

    /**
     * POST /api/hero-image — upload a new hero image (admin only).
     */
    @PostMapping
    public ResponseEntity<?> uploadHeroImage(@RequestParam("file") MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(imagesPath).resolve(filename);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toFile());

            // Delete old image file and DB record
            List<HeroImage> existing = heroImageRepository.findAll();
            for (HeroImage old : existing) {
                try {
                    Files.deleteIfExists(Paths.get(imagesPath).resolve(old.getPath()));
                } catch (Exception ignored) {
                }
            }
            heroImageRepository.deleteAll(existing);

            HeroImage hero = new HeroImage();
            hero.setPath(filename);
            heroImageRepository.save(hero);

            return ResponseEntity.ok(Map.of("path", filename));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }
}
