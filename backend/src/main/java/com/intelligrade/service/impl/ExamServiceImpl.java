package com.intelligrade.service.impl;

import com.intelligrade.dto.exam.ExamDto;
import com.intelligrade.dto.exam.KeyConceptDto;
import com.intelligrade.dto.exam.ParseQuestionPaperRequestDto;
import com.intelligrade.dto.exam.QuestionDto;
import com.intelligrade.entity.ExamEntity;
import com.intelligrade.entity.QuestionEntity;
import com.intelligrade.repository.ExamRepository;
import com.intelligrade.repository.QuestionRepository;
import com.intelligrade.service.ExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    private static final Map<String, ExamDto> EXAM_CACHE = new ConcurrentHashMap<>();

    static {
        ExamDto defaultExam = ExamDto.builder()
                .id("exam-1")
                .title("Mid-Semester Examination: Advanced Operating Systems")
                .subject("Computer Science & Engineering")
                .courseCode("CS-301")
                .gradeLevel("Undergraduate B.Tech 3rd Year")
                .totalMarks(30)
                .durationMinutes(90)
                .instructions(List.of(
                        "Answer all questions concisely in academic technical terms.",
                        "Diagrams, equations, and algorithmic steps carry full partial credit."
                ))
                .questions(List.of(
                        QuestionDto.builder()
                                .id("q_1_default")
                                .questionNumber(1)
                                .questionText("Explain the difference between preemptive and non-preemptive scheduling.")
                                .maxMarks(10.0)
                                .topic("CPU Scheduling")
                                .difficulty("Medium")
                                .modelAnswer("Preemptive scheduling allows process interruption by higher priority processes; non-preemptive requires completion.")
                                .keyConcepts(List.of(
                                        KeyConceptDto.builder().concept("Preemption Mechanism").weightMarks(5.0).description("Process interruption").build(),
                                        KeyConceptDto.builder().concept("Context Switching Overhead").weightMarks(5.0).description("State preservation").build()
                                ))
                                .build()
                ))
                .build();
        EXAM_CACHE.put("exam-1", defaultExam);
    }

    @Override
    public List<ExamDto> getAllExams() {
        try {
            List<ExamEntity> entities = examRepository.findAll();
            if (!entities.isEmpty()) {
                List<ExamDto> dtos = new ArrayList<>();
                for (ExamEntity e : entities) {
                    dtos.add(toDto(e));
                }
                return dtos;
            }
        } catch (Exception e) {
            log.warn("Database query failed, returning cache: {}", e.getMessage());
        }
        return new ArrayList<>(EXAM_CACHE.values());
    }

    @Override
    public ExamDto getExamById(String id) {
        try {
            Optional<ExamEntity> entity = examRepository.findById(id);
            if (entity.isPresent()) {
                return toDto(entity.get());
            }
        } catch (Exception e) {
            log.warn("Database lookup failed, falling back to cache: {}", e.getMessage());
        }
        return EXAM_CACHE.get(id);
    }

    @Override
    public ExamDto saveExam(ExamDto examDto) {
        String id = examDto.getId() != null ? examDto.getId() : "exam_" + System.currentTimeMillis();
        examDto.setId(id);

        try {
            ExamEntity entity = toEntity(examDto);
            examRepository.save(entity);
        } catch (Exception e) {
            log.warn("Database save failed, caching in memory: {}", e.getMessage());
        }

        EXAM_CACHE.put(id, examDto);
        return examDto;
    }

    @Override
    public ExamDto parseQuestionPaper(ParseQuestionPaperRequestDto request) {
        String rawText = request.getRawText();
        String subject = request.getSubject() != null ? request.getSubject() : "Academic Examination";
        String examTitle = request.getExamTitle() != null ? request.getExamTitle() : subject + " Question Paper";

        List<QuestionDto> parsedQuestions = extractQuestionsFromText(rawText, subject);

        double totalMarks = 0;
        for (QuestionDto q : parsedQuestions) {
            totalMarks += q.getMaxMarks() != null ? q.getMaxMarks() : 10.0;
        }

        String id = "exam_" + System.currentTimeMillis();
        ExamDto examDto = ExamDto.builder()
                .id(id)
                .title(examTitle)
                .subject(subject)
                .courseCode("EXAM-2026")
                .gradeLevel("Undergraduate")
                .totalMarks((int) totalMarks)
                .durationMinutes(90)
                .instructions(List.of(
                        "Answer all questions concisely in standard academic format.",
                        "Show all equations, derivations, and diagrams where required."
                ))
                .questions(parsedQuestions)
                .build();

        saveExam(examDto);
        return examDto;
    }

    private List<QuestionDto> extractQuestionsFromText(String rawText, String subjectHint) {
        List<QuestionDto> questions = new ArrayList<>();
        if (rawText == null || rawText.isBlank()) {
            return generateSubjectQuestions(subjectHint);
        }

        String[] lines = rawText.split("\n");
        Pattern qPattern = Pattern.compile("^(?:(?:Q|Question|Que|Prob|Problem)\\.?\\s*(\\d+)[:.)\\-]?|(\\d+)[:.)])\\s*(.+)", Pattern.CASE_INSENSITIVE);
        Pattern marksPattern = Pattern.compile("(?:\\(|\\[)?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:marks?|pts?|points?|m)?\\s*(?:\\)|\\])?", Pattern.CASE_INSENSITIVE);

        QuestionDto currentQ = null;
        int currentNum = 1;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;

            Matcher qMatcher = qPattern.matcher(line);
            if (qMatcher.find()) {
                if (currentQ != null) {
                    questions.add(currentQ);
                }

                String numStr = qMatcher.group(1) != null ? qMatcher.group(1) : qMatcher.group(2);
                int qNum = numStr != null ? Integer.parseInt(numStr) : currentNum;
                currentNum = qNum + 1;

                String text = qMatcher.group(3) != null ? qMatcher.group(3).trim() : "";
                double marks = 10.0;

                Matcher mMatcher = marksPattern.matcher(text);
                if (mMatcher.find()) {
                    try {
                        marks = Double.parseDouble(mMatcher.group(1));
                        text = text.replaceAll("(?:\\(|\\[)?\\s*\\d+(?:\\.\\d+)?\\s*(?:marks?|pts?|points?|m)?\\s*(?:\\)|\\])?", "").trim();
                    } catch (Exception ignored) {}
                }

                currentQ = createQuestionDto(qNum, text, marks, subjectHint);
            } else if (currentQ != null) {
                currentQ.setQuestionText(currentQ.getQuestionText() + " " + line);
            }
        }

        if (currentQ != null) {
            questions.add(currentQ);
        }

        if (questions.isEmpty()) {
            return generateSubjectQuestions(subjectHint);
        }

        return questions;
    }

    private QuestionDto createQuestionDto(int num, String text, double marks, String subject) {
        return QuestionDto.builder()
                .id("q_" + num + "_" + System.currentTimeMillis())
                .questionNumber(num)
                .questionText(text)
                .maxMarks(marks)
                .topic(subject + " Topic " + num)
                .difficulty(num == 1 ? "Easy" : num == 2 ? "Medium" : "Hard")
                .modelAnswer("Official solution guideline for question " + num + ": clear articulation of definitions, formulas, and diagrams.")
                .keyConcepts(List.of(
                        KeyConceptDto.builder().concept("Key Principles").weightMarks(marks * 0.5).description("Theoretical foundation").build(),
                        KeyConceptDto.builder().concept("Implementation & Derivation").weightMarks(marks * 0.5).description("Applied solution").build()
                ))
                .build();
    }

    private List<QuestionDto> generateSubjectQuestions(String subject) {
        return List.of(
                createQuestionDto(1, "Explain fundamental principles and conceptual framework of " + subject + ".", 10.0, subject),
                createQuestionDto(2, "Analyze comparative trade-offs, constraints, and operational mechanisms in " + subject + ".", 10.0, subject),
                createQuestionDto(3, "Formulate a step-by-step derivation or proof for an advanced problem in " + subject + ".", 10.0, subject)
        );
    }

    private ExamDto toDto(ExamEntity entity) {
        List<QuestionDto> qDtos = new ArrayList<>();
        if (entity.getQuestions() != null) {
            for (QuestionEntity q : entity.getQuestions()) {
                qDtos.add(QuestionDto.builder()
                        .id(q.getId())
                        .questionNumber(q.getQuestionNumber())
                        .questionText(q.getQuestionText())
                        .maxMarks(q.getMaxMarks() != null ? q.getMaxMarks().doubleValue() : 10.0)
                        .topic(q.getTopic())
                        .difficulty(q.getDifficulty())
                        .modelAnswer(q.getOfficialModelAnswer())
                        .build());
            }
        }

        return ExamDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .subject(entity.getSubject())
                .gradeLevel(entity.getGradeLevel())
                .totalMarks(entity.getTotalMarks())
                .instructions(entity.getInstructions() != null ? List.of(entity.getInstructions().split("\n")) : List.of())
                .createdBy(entity.getCreatedBy())
                .questions(qDtos)
                .build();
    }

    private ExamEntity toEntity(ExamDto dto) {
        ExamEntity entity = new ExamEntity();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setSubject(dto.getSubject());
        entity.setGradeLevel(dto.getGradeLevel());
        entity.setTotalMarks(dto.getTotalMarks());
        entity.setInstructions(dto.getInstructions() != null ? String.join("\n", dto.getInstructions()) : "");
        entity.setCreatedBy(dto.getCreatedBy());
        entity.setCreatedAt(LocalDateTime.now());
        return entity;
    }
}
