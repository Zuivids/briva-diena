package lv.brivadiena.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.uploads-path}")
    private String uploadsPath;

    @Value("${app.images-path}")
    private String imagesPath;

    // CORS is configured in SecurityConfig (handles preflight correctly with JWT filter)

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(uploadsPath).toAbsolutePath();
        String uploadPath = "file:" + uploadDir.toString() + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);

        String imagesDir = "file:" + Paths.get(imagesPath).toAbsolutePath().toString() + "/";
        registry.addResourceHandler("/images/**")
                .addResourceLocations(imagesDir);
    }
}
