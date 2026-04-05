package lv.brivadiena.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration to serve static files (images) from the uploads directory.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.uploads-path}")
    private String uploadsPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert uploads path to absolute and create file:// URL
        Path uploadDir = Paths.get(uploadsPath).toAbsolutePath();
        String uploadPath = "file:" + uploadDir.toString() + "/";

        // Map /uploads/** requests to the actual uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
