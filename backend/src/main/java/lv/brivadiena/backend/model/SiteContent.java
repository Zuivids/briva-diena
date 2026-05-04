package lv.brivadiena.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "site_content")
public class SiteContent {

    @Id
    @Column(name = "key_name", length = 255)
    private String keyName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String value;

    public SiteContent() {
    }

    public SiteContent(String keyName, String value) {
        this.keyName = keyName;
        this.value = value;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
