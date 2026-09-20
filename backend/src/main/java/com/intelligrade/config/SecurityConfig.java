package com.intelligrade.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers("/api/v1/auth/**", "/api/v1/health", "/api/v1/files/**").permitAll()
                .requestMatchers("/api/ai/**", "/api/v1/ai/**").permitAll()
                .requestMatchers("/api/v1/exams/**").permitAll()
                .requestMatchers("/api/v1/submissions/check-duplicate").permitAll()
                // Role-Specific Endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/grade/**", "/api/v1/ocr/**", "/api/v1/model-answers/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/evaluations/**").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                .requestMatchers("/api/v1/evaluations/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/v1/submissions/**").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                .requestMatchers("/api/v1/student/**").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
