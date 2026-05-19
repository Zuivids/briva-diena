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
import java.util.LinkedHashMap;
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

    // ── DTO for settings updates ───────────────────────────────────────────────
    public static class HeroSettingsRequest {
        private Integer overlayOpacity;
        private String textContent;
        private String textFont;
        private Boolean textBold;
        private Integer textSize;

        public Integer getOverlayOpacity() {
            return overlayOpacity;
        }

        public void setOverlayOpacity(Integer overlayOpacity) {
            this.overlayOpacity = overlayOpacity;
        }

        public String getTextContent() {
            return textContent;
        }

        public void setTextContent(String textContent) {
            this.textContent = textContent;
        }

        public String getTextFont() {
            return textFont;
        }

        public void setTextFont(String textFont) {
            this.textFont = textFont;
        }

        public Boolean getTextBold() {
            return textBold;
        }

        public void setTextBold(Boolean textBold) {
            this.textBold = textBold;
        }

        public Integer getTextSize() {
            return textSize;
        }

        public void setTextSize(Integer textSize) {
            this.textSize = textSize;
        }

        private String textPosition;
        private String googleFonts;

        public String getTextPosition() {
            return textPosition;
        }

        public void setTextPosition(String textPosition) {
            this.textPosition = textPosition;
        }

        public String getGoogleFonts() {
            return googleFonts;
        }

        public void setGoogleFonts(String googleFonts) {
            this.googleFonts = googleFonts;
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Map<String, Object> toMap(HeroImage img) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("path", img.getPath());
        m.put("overlayOpacity", img.getOverlayOpacity());
        m.put("textContent", img.getTextContent());
        m.put("textFont", img.getTextFont());
        m.put("textBold", img.isTextBold());
        m.put("textSize", img.getTextSize());
        m.put("textPosition", img.getTextPosition());
        m.put("googleFonts", img.getGoogleFonts());
        return m;
    }

    private Map<String, Object> defaults() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("path", "");
        m.put("overlayOpacity", 0);
        m.put("textContent", "Mazas grupas \u2013 lieli iespaidi");
        m.put("textFont", "inherit");
        m.put("textBold", true);
        m.put("textSize", 32);
        m.put("textPosition", "left");
        m.put("googleFonts", "");
        return m;
    }

    private HeroImage getOrCreateRecord() {
        List<HeroImage> all = heroImageRepository.findAll();
        if (!all.isEmpty())
            return all.get(0);
        HeroImage hero = new HeroImage();
        hero.setPath("");
        return heroImageRepository.save(hero);
    }

    // ── GET /api/hero-image ────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHeroImage() {
        return heroImageRepository.findAll().stream()
                .findFirst()
                .map(img -> ResponseEntity.ok(toMap(img)))
                .orElse(ResponseEntity.ok(defaults()));
    }

    // ── POST /api/hero-image — upload new image ────────────────────────────────
    @PostMapping
    public ResponseEntity<?> uploadHeroImage(@RequestParam("file") MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(imagesPath).resolve(filename);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toAbsolutePath().toFile());

            // Preserve existing settings, delete old image file only
            HeroImage hero = getOrCreateRecord();
            if (!hero.getPath().isBlank()) {
                try {
                    Files.deleteIfExists(Paths.get(imagesPath).resolve(hero.getPath()).toAbsolutePath());
                } catch (Exception ignored) {
                }
            }
            hero.setPath(filename);
            heroImageRepository.save(hero);

            return ResponseEntity.ok(toMap(hero));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    // ── PATCH /api/hero-image/settings — update text/overlay settings ──────────
    @PatchMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody HeroSettingsRequest req) {
        HeroImage hero = getOrCreateRecord();
        if (req.getOverlayOpacity() != null) {
            int clamped = Math.max(-100, Math.min(100, req.getOverlayOpacity()));
            hero.setOverlayOpacity(clamped);
        }
        if (req.getTextContent() != null)
            hero.setTextContent(req.getTextContent());
        if (req.getTextFont() != null)
            hero.setTextFont(req.getTextFont());
        if (req.getTextBold() != null)
            hero.setTextBold(req.getTextBold());
        if (req.getTextSize() != null) {
            int clamped = Math.max(8, Math.min(120, req.getTextSize()));
            hero.setTextSize(clamped);
        }
        if (req.getTextPosition() != null) {
            String pos = req.getTextPosition();
            if (pos.equals("left") || pos.equals("center") || pos.equals("right")) {
                hero.setTextPosition(pos);
            }
        }
        if (req.getGoogleFonts() != null)
            hero.setGoogleFonts(req.getGoogleFonts());
        heroImageRepository.save(hero);
        return ResponseEntity.ok(toMap(hero));
    }
}
