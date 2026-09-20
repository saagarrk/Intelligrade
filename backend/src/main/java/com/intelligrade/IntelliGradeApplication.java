package com.intelligrade;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * IntelliGrade Spring Boot Main Application Entry Point.
 * Provides production-grade REST microservices for:
 * 1. RBAC Authentication & Session Validation (/api/v1/auth/*)
 * 2. Multimodal OCR Text Transcription (/api/v1/ocr/*)
 * 3. 3-Way Tri-Sheet NLP Grading Engine (/api/v1/grade/*)
 * 4. Model Answer & Semantic Paraphrase Generation (/api/v1/model-answers/*)
 * 5. Predictive Analytics & Knowledge Radar Insights (/api/v1/insights/*)
 */
@SpringBootApplication
public class IntelliGradeApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntelliGradeApplication.class, args);
        System.out.println("===================================================================");
        System.out.println("IntelliGrade Spring Boot REST Server Running on http://localhost:8080");
        System.out.println("Multimodal AI Pipeline & MySQL Engine Ready.");
        System.out.println("===================================================================");
    }
}
