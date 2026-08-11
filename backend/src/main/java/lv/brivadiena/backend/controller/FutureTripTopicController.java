package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.FutureTripTopic;
import lv.brivadiena.backend.repository.FutureTripTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/future-trip-topics")
public class FutureTripTopicController {

    @Autowired
    private FutureTripTopicRepository futureTripTopicRepository;

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
        if (!futureTripTopicRepository.existsById(id))
            return ResponseEntity.notFound().build();
        futureTripTopicRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
