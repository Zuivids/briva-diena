package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.FutureTripsCard;
import lv.brivadiena.backend.repository.FutureTripsCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/future-trips-card")
public class FutureTripsCardController {

    @Autowired
    private FutureTripsCardRepository futureTripsCardRepository;

    @Value("${app.images-path:./images}")
    private String imagesPath;

    public static class SettingsRequest {
        private String title;
        private Boolean enabled;
        private String introText;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }

        public String getIntroText() {
            return introText;
        }

        public void setIntroText(String introText) {
            this.introText = introText;
        }
    }

    private Map<String, Object> toMap(FutureTripsCard card) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("title", card.getTitle());
        m.put("enabled", card.isEnabled());
        m.put("imagePath", card.getImagePath());
        m.put("introText", card.getIntroText());
        return m;
    }

    private FutureTripsCard getOrCreateRecord() {
        return futureTripsCardRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> futureTripsCardRepository.save(new FutureTripsCard()));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCard() {
        return ResponseEntity.ok(toMap(getOrCreateRecord()));
    }

    @PatchMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody SettingsRequest req) {
        FutureTripsCard card = getOrCreateRecord();
        if (req.getTitle() != null)
            card.setTitle(req.getTitle());
        if (req.getEnabled() != null)
            card.setEnabled(req.getEnabled());
        if (req.getIntroText() != null)
            card.setIntroText(req.getIntroText());
        futureTripsCardRepository.save(card);
        return ResponseEntity.ok(toMap(card));
    }

    @PostMapping
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(imagesPath).resolve(filename);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toAbsolutePath().toFile());

            FutureTripsCard card = getOrCreateRecord();
            if (!card.getImagePath().isBlank()) {
                try {
                    Files.deleteIfExists(Paths.get(imagesPath).resolve(card.getImagePath()).toAbsolutePath());
                } catch (Exception ignored) {
                }
            }
            card.setImagePath(filename);
            futureTripsCardRepository.save(card);

            return ResponseEntity.ok(toMap(card));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }
}
