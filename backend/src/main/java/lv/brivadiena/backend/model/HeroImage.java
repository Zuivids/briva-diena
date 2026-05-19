package lv.brivadiena.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hero_image")
public class HeroImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1024, nullable = false)
    private String path;

    @Column(name = "overlay_opacity", nullable = false)
    private int overlayOpacity = 0;

    @Column(name = "text_content", length = 500, nullable = false)
    private String textContent = "Mazas grupas \u2013 lieli iespaidi";

    @Column(name = "text_font", length = 100, nullable = false)
    private String textFont = "inherit";

    @Column(name = "text_bold", nullable = false)
    private boolean textBold = true;

    @Column(name = "text_size", nullable = false)
    private int textSize = 32;

    @Column(name = "text_position", length = 10, nullable = false)
    private String textPosition = "left";

    @Column(name = "google_fonts", length = 500, nullable = false)
    private String googleFonts = "";

    public HeroImage() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public int getOverlayOpacity() {
        return overlayOpacity;
    }

    public void setOverlayOpacity(int overlayOpacity) {
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

    public boolean isTextBold() {
        return textBold;
    }

    public void setTextBold(boolean textBold) {
        this.textBold = textBold;
    }

    public int getTextSize() {
        return textSize;
    }

    public void setTextSize(int textSize) {
        this.textSize = textSize;
    }

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
