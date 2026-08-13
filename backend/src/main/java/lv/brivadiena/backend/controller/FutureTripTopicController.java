package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.FutureTripTopic;
import lv.brivadiena.backend.repository.FutureTripTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/future-trip-topics")
public class FutureTripTopicController {

    @Autowired
    private FutureTripTopicRepository futureTripTopicRepository;

    @Value("${app.images-path:./images}")
    private String imagesPath;

    @GetMapping
    public ResponseEntity<List<FutureTripTopic>> getAll() {
        return ResponseEntity.ok(futureTripTopicRepository.findAllByOrderBySortOrderAsc());
    }

    @PostMapping
    public ResponseEntity<FutureTripTopic> create(@RequestBody FutureTripTopic topic) {
        FutureTripTopic saved = futureTripTopicRepository.save(topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FutureTripTopic> update(@PathVariable Long id, @RequestBody FutureTripTopic details) {
        Optional<FutureTripTopic> opt = futureTripTopicRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        FutureTripTopic topic = opt.get();
        topic.setTitle(details.getTitle());
        topic.setDescription(details.getDescription());
        topic.setSortOrder(details.getSortOrder());
        return ResponseEntity.ok(futureTripTopicRepository.save(topic));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<FutureTripTopic> opt = futureTripTopicRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        deleteImageFile(opt.get().getImagePath());
        futureTripTopicRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<FutureTripTopic> opt = futureTripTopicRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        FutureTripTopic topic = opt.get();
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(imagesPath).resolve(filename);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toAbsolutePath().toFile());

            deleteImageFile(topic.getImagePath());
            topic.setImagePath(filename);
            return ResponseEntity.ok(futureTripTopicRepository.save(topic));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    private void deleteImageFile(String imagePath) {
        if (imagePath == null || imagePath.isBlank())
            return;
        try {
            Files.deleteIfExists(Paths.get(imagesPath).resolve(imagePath).toAbsolutePath());
        } catch (Exception ignored) {
        }
    }
}
