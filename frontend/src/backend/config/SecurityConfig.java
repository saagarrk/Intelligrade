package com.intelligrade.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Spring Security 6.x / Spring Boot 3.x Security Configuration for IntelliGrade.
 * Defines stateless JWT security filter chain, enforces Bearer token validation,
 * rejects requests lacking valid Authorization headers, and establishes RBAC policies.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint unauthorizedHandler,
            UserDetailsService userDetailsService
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.unauthorizedHandler = unauthorizedHandler;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Configures the main SecurityFilterChain with stateless JWT authentication.
     * Rejects all requests lacking valid Authorization headers for protected endpoints.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF for stateless REST API
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Enable CORS with configurable origins
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Exception Handling for unauthorized / unauthenticated requests
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
            )

            // 4. Session Management: STRICTLY STATELESS (No server sessions, JWT only)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 5. URL-Level Authorization Rules & RBAC
            .authorizeHttpRequests(auth -> auth
                // Public authentication & health check routes
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/health").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Student Portal: Requires authenticated STUDENT or ADMIN role
                .requestMatchers("/api/v1/student/**").hasAnyRole("STUDENT", "ADMIN")

                // Faculty / Teacher Portal: Grading, OCR extraction & Batch processing
                .requestMatchers("/api/v1/grade/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/v1/ocr/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/v1/batch/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/v1/model-answers/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/v1/gemini/**").hasAnyRole("TEACHER", "ADMIN")

                // Administrator Portal: User directory & System audit logs
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // All other endpoints require valid Bearer token authentication
                .anyRequest().authenticated()
            )

            // 6. Register DAO Authentication Provider
            .authenticationProvider(authenticationProvider())

            // 7. Inject JWT Authentication Filter before Spring's UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * JWT Authentication Entry Point returning HTTP 401 Unauthorized for requests lacking valid tokens.
     */
    @Component
    public static class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
        @Override
        public void commence(
                HttpServletRequest request,
                HttpServletResponse response,
                org.springframework.security.core.AuthenticationException authException
        ) throws IOException {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(String.format(
                "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Access Denied: Missing or invalid Authorization Bearer token.\",\"path\":\"%s\"}",
                request.getRequestURI()
            ));
        }
    }

    /**
     * OncePerRequestFilter extracting, verifying, and validating JWT Bearer tokens from incoming requests.
     */
    @Component
    public static class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtTokenValidator tokenValidator;
        private final UserDetailsService userDetailsService;

        public JwtAuthenticationFilter(JwtTokenValidator tokenValidator, UserDetailsService userDetailsService) {
            this.tokenValidator = tokenValidator;
            this.userDetailsService = userDetailsService;
        }

        @Override
        protected void doFilterInternal(
                @NonNull HttpServletRequest request,
                @NonNull HttpServletResponse response,
                @NonNull FilterChain filterChain
        ) throws ServletException, IOException {
            try {
                String jwt = extractJwtFromRequest(request);

                if (StringUtils.hasText(jwt) && tokenValidator.validateToken(jwt)) {
                    String username = tokenValidator.getUsernameFromToken(jwt);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception ex) {
                logger.error("Failed to authenticate JWT Bearer token in security filter chain", ex);
            }

            filterChain.doFilter(request, response);
        }

        private String extractJwtFromRequest(HttpServletRequest request) {
            String bearerToken = request.getHeader("Authorization");
            if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
                return bearerToken.substring(7);
            }
            return null;
        }
    }

    /**
     * Interface for JWT Token parsing & validation.
     */
    public interface JwtTokenValidator {
        boolean validateToken(String token);
        String getUsernameFromToken(String token);
    }
}
