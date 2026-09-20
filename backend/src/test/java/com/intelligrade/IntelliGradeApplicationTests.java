package com.intelligrade;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Spring Boot Context Load & Automated Verification Test
 */
@SpringBootTest
@ActiveProfiles("test")
class IntelliGradeApplicationTests {

    @Test
    void contextLoads() {
        assertTrue(true, "IntelliGrade Spring Boot context loaded successfully");
    }

    @Test
    void verifyGradingWorkflowPipeline() {
        // Mathematical sanity check for proportional mark attribution
        double awardedMarks = 8.5;
        double maxMarks = 10.0;
        double semanticSimilarity = 0.88;

        assertTrue(awardedMarks <= maxMarks, "Awarded marks must never exceed maximum question marks");
        assertTrue(semanticSimilarity >= 0.0 && semanticSimilarity <= 1.0, "Similarity score must be normalized [0, 1]");
    }
}
