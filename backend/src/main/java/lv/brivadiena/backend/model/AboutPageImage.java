package lv.brivadiena.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "about_page_images")
public class AboutPageImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_index", nullable = false, unique = true)
    private Integer slotIndex;

    @Column(length = 1024, nullable = false)
    private String path;

    public AboutPageImage() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSlotIndex() {
        return slotIndex;
    }

    public void setSlotIndex(Integer slotIndex) {
        this.slotIndex = slotIndex;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
