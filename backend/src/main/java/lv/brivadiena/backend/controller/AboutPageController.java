package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.AboutPageImage;
import lv.brivadiena.backend.repository.AboutPageImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/about-images")
public class AboutPageController {

    @Autowired
    private AboutPageImageRepository aboutPageImageRepository;

    @Value("${app.images-path:./images}")
    private String imagesPath;

    /**
     * GET /api/about-images - Returns all stored about-page images
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAboutImages() {
        var result = aboutPageImageRepository.findAll().stream().map(img -> {
            Map<String, Object> m = new HashMap<>();
            m.put("slotIndex", img.getSlotIndex());
            m.put("path", img.getPath());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/about-images/{slotIndex} - Upload image for a slot (0, 1, or 2)
     */
    @PostMapping("/{slotIndex}")
    public ResponseEntity<?> uploadAboutImage(@PathVariable int slotIndex,
            @RequestParam("file") MultipartFile file) {
        if (slotIndex < 0 || slotIndex > 2) {
            return ResponseEntity.badRequest().body("slotIndex must be 0, 1, or 2");
        }
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(imagesPath).resolve(filename);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toFile());

            // Remove existing record (and file) for this slot
            aboutPageImageRepository.findBySlotIndex(slotIndex).ifPresent(existing -> {
                try {
                    Files.deleteIfExists(Paths.get(imagesPath).resolve(existing.getPath()));
                } catch (Exception ignored) {
                }
                aboutPageImageRepository.delete(existing);
            });

            AboutPageImage img = new AboutPageImage();
            img.setSlotIndex(slotIndex);
            img.setPath(filename);
            aboutPageImageRepository.save(img);

            Map<String, Object> result = new HashMap<>();
            result.put("slotIndex", slotIndex);
            result.put("path", filename);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/about-images/{slotIndex} - Remove image from a slot
     */
    @DeleteMapping("/{slotIndex}")
    public ResponseEntity<Void> deleteAboutImage(@PathVariable int slotIndex) {
        aboutPageImageRepository.findBySlotIndex(slotIndex).ifPresent(img -> {
            try {
                Files.deleteIfExists(Paths.get(imagesPath).resolve(img.getPath()));
            } catch (Exception ignored) {
            }
            aboutPageImageRepository.delete(img);
        });
        return ResponseEntity.noContent().build();
    }
}
