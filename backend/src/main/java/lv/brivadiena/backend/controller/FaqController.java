package lv.brivadiena.backend.controller;

import lv.brivadiena.backend.model.FaqItem;
import lv.brivadiena.backend.repository.FaqItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faq")
public class FaqController {

    @Autowired
    private FaqItemRepository faqItemRepository;

    /** GET /api/faq — public, returns all FAQ items ordered by sortOrder */
    @GetMapping
    public ResponseEntity<List<FaqItem>> getAll() {
        return ResponseEntity.ok(faqItemRepository.findAllByOrderBySortOrderAscIdAsc());
    }

    /** POST /api/faq — admin only, create a new FAQ item */
    @PostMapping
    public ResponseEntity<FaqItem> create(@RequestBody Map<String, Object> body) {
        FaqItem item = new FaqItem();
        item.setQuestion((String) body.get("question"));
        item.setAnswer((String) body.get("answer"));
        Object order = body.get("sortOrder");
        if (order instanceof Integer)
            item.setSortOrder((Integer) order);
        return ResponseEntity.ok(faqItemRepository.save(item));
    }

    /** PUT /api/faq/{id} — admin only, update an existing FAQ item */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return faqItemRepository.findById(id).map(item -> {
            if (body.containsKey("question"))
                item.setQuestion((String) body.get("question"));
            if (body.containsKey("answer"))
                item.setAnswer((String) body.get("answer"));
            if (body.get("sortOrder") instanceof Integer)
                item.setSortOrder((Integer) body.get("sortOrder"));
            return ResponseEntity.ok(faqItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/faq/{id} — admin only, delete a FAQ item */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        faqItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
