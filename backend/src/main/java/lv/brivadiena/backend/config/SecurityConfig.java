package lv.brivadiena.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public auth endpoints
                        .requestMatchers(HttpMethod.POST, "/api/admin/login", "/api/admin/login/verify-mfa").permitAll()
                        // Public read endpoints (trips browsing)
                        .requestMatchers(HttpMethod.GET, "/api/trips/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/landing-page").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/trips-count").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/about-images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/instagram-posts/**").permitAll()
                        // Customers submitting their own registration — public
                        .requestMatchers(HttpMethod.POST, "/api/registrations").permitAll()
                        // Static file serving
                        .requestMatchers("/uploads/**", "/images/**").permitAll()
                        // Everything else requires a valid JWT
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Prevents Spring Boot from auto-generating an in-memory user.
     * Authentication is handled via JWT — this service is never actually called.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> { throw new UsernameNotFoundException("JWT authentication only"); };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
