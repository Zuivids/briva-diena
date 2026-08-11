package lv.brivadiena.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "future_trips_card")
public class FutureTripsCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500, nullable = false)
    private String title = "Uzzini par jaunākiem ceļojumiem 2027";

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(name = "image_path", length = 1024, nullable = false)
    private String imagePath = "";

    @Column(name = "intro_text", length = 2000, nullable = false)
    private String introText = "2027. gadā plānojam vairākus jaunus ceļojumu virzienus. Precīzi datumi un cenas vēl tiek apstiprināti — piesakies uz jebkuru no tēmām, un mēs tevi informēsim, tiklīdz būs jaunumi.";

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getIntroText() {
        return introText;
    }

    public void setIntroText(String introText) {
        this.introText = introText;
    }
}
