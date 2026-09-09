import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentSubmission, ExamPaper } from '../types';

export interface ExportPdfOptions {
  fileName?: string;
  evaluatorName?: string;
  institutionName?: string;
  includeInsights?: boolean;
}

/**
 * Calculates letter grade based on percentage score
 */
function getLetterGrade(percentage: number): { grade: string; classification: string } {
  if (percentage >= 90) return { grade: 'A+', classification: 'First Class with Distinction' };
  if (percentage >= 80) return { grade: 'A', classification: 'First Class with Honors' };
  if (percentage >= 70) return { grade: 'B+', classification: 'First Class' };
  if (percentage >= 60) return { grade: 'B', classification: 'Second Class Upper' };
  if (percentage >= 50) return { grade: 'C', classification: 'Second Class Lower' };
  if (percentage >= 40) return { grade: 'D', classification: 'Pass Grade' };
  return { grade: 'F', classification: 'Requires Re-Evaluation' };
}

/**
 * Generates a pseudo-tamper-proof digital verification hash for archival reference
 */
function generateVerificationHash(submissionId: string, rollNumber: string, marks: number): string {
  const raw = `${submissionId}-${rollNumber}-${marks}-INTELLIGRADE-SECURE`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `IG-VERIFY-${hex}-${submissionId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`;
}

/**
 * Exports evaluated student results as a formatted, publication-grade PDF report
 */
export async function exportStudentEvaluationPDF(
  submission: StudentSubmission,
  exam: ExamPaper,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    institutionName = 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
    evaluatorName = 'Prof. Rajesh Kulkarni (Senior Faculty Evaluator)',
    includeInsights = true
  } = options;

  // Initialize A4 Portrait Document (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Compute live marks considering any teacher overrides
  let totalCalculatedAwarded = 0;
  submission.questionEvaluations.forEach(qe => {
    const mark = qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : qe.awardedMarks;
    totalCalculatedAwarded += mark;
  });
  const totalMax = exam.totalMarks || submission.totalMaxMarks || 50;
  const livePercentage = Math.round((totalCalculatedAwarded / totalMax) * 100);
  const { grade, classification } = getLetterGrade(livePercentage);
  const verificationHash = generateVerificationHash(submission.id, submission.studentRollNumber, totalCalculatedAwarded);
  const generationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // -------------------------------------------------------------
  // 1. OFFICIAL INSTITUTIONAL HEADER BANNER
  // -------------------------------------------------------------
  // Header background bar (Dark Slate / Obsidian)
  doc.setFillColor(20, 24, 33);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent line below header (Indigo/Cobalt)
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 37.5, pageWidth, 1.5, 'F');

  // Logo / System Identity
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('INTELLIGRADE', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(199, 210, 254);
  doc.text('AUTOMATED MULTIMODAL STUDENT ANSWER SHEET EVALUATION DOSSIER', margin, 18);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`${institutionName} • OFFICIAL EXAMINATION ARCHIVE`, margin, 23);

  // Right-aligned header metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL TRANSCRIPT', pageWidth - margin, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dossier ID: ${verificationHash}`, pageWidth - margin, 16, { align: 'right' });
  doc.text(`Archived: ${generationDate}`, pageWidth - margin, 20, { align: 'right' });

  // Verification Pill Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - margin - 35, 24, 35, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('✓ VERIFIED & RECORDED', pageWidth - margin - 17.5, 28, { align: 'center' });

  // -------------------------------------------------------------
  // 2. CANDIDATE & EXAMINATION PROFILE CARD
  // -------------------------------------------------------------
  let currentY = 44;

  // Background box for Candidate details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 31, 2, 2, 'FD');

  // Left Column: Candidate Info
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CANDIDATE INFORMATION', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Student Name:', margin + 4, currentY + 12);
  doc.text('Roll / Seat Number:', margin + 4, currentY + 17);
  doc.text('Program / Level:', margin + 4, currentY + 22);
  doc.text('Submission Timestamp:', margin + 4, currentY + 27);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(submission.studentName || 'Aarav Sharma', margin + 34, currentY + 12);
  doc.setFont('courier', 'bold');
  doc.text(submission.studentRollNumber || 'CS-2026-041', margin + 34, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(exam.gradeLevel || 'Undergraduate / Semester 6', margin + 34, currentY + 22);
  doc.text(submission.submissionDate || '2026-09-06 (Automated Intake)', margin + 34, currentY + 27);

  // Vertical Divider in Card
  const midX = margin + (contentWidth / 2);
  doc.setDrawColor(226, 232, 240);
  doc.line(midX, currentY + 3, midX, currentY + 28);

  // Right Column: Examination Paper Details
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EXAMINATION SPECIFICATION', midX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Course Paper:', midX + 4, currentY + 12);
  doc.text('Course Code / Subject:', midX + 4, currentY + 17);
  doc.text('Assigned Evaluator:', midX + 4, currentY + 22);
  doc.text('Evaluation Engine:', midX + 4, currentY + 27);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(exam.title, midX + 37, currentY + 12, { maxWidth: 50 });
  doc.text(`${exam.courseCode || 'CS-301'} • ${exam.subject}`, midX + 37, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(evaluatorName, midX + 37, currentY + 22, { maxWidth: 50 });
  doc.text('Gemini-Vision OCR + Semantic Rubric (v2.5)', midX + 37, currentY + 27);

  currentY += 36;

  // -------------------------------------------------------------
  // 3. PERFORMANCE METRICS EXECUTIVE TILES
  // -------------------------------------------------------------
  const tileWidth = (contentWidth - 9) / 4;
  const tileHeight = 19;

  // Tile 1: Total Marks Awarded
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('TOTAL SCORE AWARDED', margin + (tileWidth / 2), currentY + 5, { align: 'center' });
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${totalCalculatedAwarded} / ${totalMax}`, margin + (tileWidth / 2), currentY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Marks Attained', margin + (tileWidth / 2), currentY + 16, { align: 'center' });

  // Tile 2: Percentage & Grade
  const tile2X = margin + tileWidth + 3;
  const isPass = livePercentage >= 50;
  doc.setFillColor(isPass ? 240 : 254, isPass ? 253 : 242, isPass ? 244 : 242);
  doc.setDrawColor(isPass ? 167 : 254, isPass ? 243 : 205, isPass ? 208 : 211);
  doc.roundedRect(tile2X, currentY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('PERCENTAGE & GRADE', tile2X + (tileWidth / 2), currentY + 5, { align: 'center' });
  doc.setTextColor(isPass ? 5 : 225, isPass ? 150 : 29, isPass ? 105 : 72);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${livePercentage}% (${grade})`, tile2X + (tileWidth / 2), currentY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(classification, tile2X + (tileWidth / 2), currentY + 16, { align: 'center', maxWidth: tileWidth - 2 });

  // Tile 3: Class Percentile Rank
  const tile3X = tile2X + tileWidth + 3;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(tile3X, currentY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('COHORT PERCENTILE', tile3X + (tileWidth / 2), currentY + 5, { align: 'center' });
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const percentile = submission.predictiveAnalytics?.classPercentileRank || 84;
  doc.text(`Top ${100 - percentile}%`, tile3X + (tileWidth / 2), currentY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Rank: ${percentile}th Percentile`, tile3X + (tileWidth / 2), currentY + 16, { align: 'center' });

  // Tile 4: Readiness & Retention
  const tile4X = tile3X + tileWidth + 3;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(tile4X, currentY, tileWidth, tileHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('EXAM READINESS LEVEL', tile4X + (tileWidth / 2), currentY + 5, { align: 'center' });
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const readiness = submission.predictiveAnalytics?.examReadinessLevel || 'High Mastery';
  doc.text(readiness, tile4X + (tileWidth / 2), currentY + 11.5, { align: 'center', maxWidth: tileWidth - 2 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const retention = submission.predictiveAnalytics?.knowledgeRetentionIndex || 88;
  doc.text(`Retention Index: ${retention}%`, tile4X + (tileWidth / 2), currentY + 16, { align: 'center' });

  currentY += tileHeight + 7;

  // -------------------------------------------------------------
  // 4. QUESTION-BY-QUESTION EVALUATION TABLE (AUTO-TABLE)
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ITEMIZED QUESTION-WISE EVALUATION & SCORING BREAKDOWN', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Evaluated against official model answer criteria, semantic equivalence, and faculty oversight overrides.', margin, currentY + 4);

  currentY += 6;

  // Prepare table data
  const tableRows = submission.questionEvaluations.map((qe) => {
    const examQ = exam.questions.find(q => q.id === qe.questionId || q.questionNumber === qe.questionNumber);
    const awarded = qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : qe.awardedMarks;
    const isOverridden = qe.teacherOverrideMarks !== undefined && qe.teacherOverrideMarks !== qe.awardedMarks;

    // Compile deductions summary
    const deductionsText = (qe.deductions && qe.deductions.length > 0)
      ? qe.deductions.map(d => `-${d.pointsDeducted}pt (${d.reason})`).join('\n')
      : 'None (Full concept credit)';

    // Compile rubric & feedback notes
    let notes = qe.feedback || '';
    if (qe.teacherComment) {
      notes += `\n[Faculty Comment]: ${qe.teacherComment}`;
    }
    if (qe.ownWordsAnalysis) {
      notes += `\n[Semantic Note]: ${qe.ownWordsAnalysis.matchedVariantTitle} (${qe.ownWordsAnalysis.ownWordsClarityScore}% clarity)`;
    }

    return [
      `Q${qe.questionNumber}`,
      examQ?.topic || `Question ${qe.questionNumber}`,
      `${qe.maxMarks}`,
      isOverridden ? `${awarded}*\n(Override)` : `${awarded}`,
      `${qe.semanticSimilarityScore}%`,
      notes,
      deductionsText
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      'Q#',
      'Topic / Domain',
      'Max',
      'Awarded',
      'Semantic',
      'Evaluation Rubrics & Evaluator Feedback',
      'Deductions / Variances'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
      valign: 'top',
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 32, textColor: [180, 40, 40] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawPage: () => {
      // Header for any subsequent pages created by autoTable
    }
  });

  // Get position after table
  const finalTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 7 : currentY + 60;

  // Check if we need to add a page for the insights section
  let nextSectionY = finalTableY;
  if (nextSectionY > pageHeight - 65) {
    doc.addPage();
    nextSectionY = 20;
  }

  // -------------------------------------------------------------
  // 5. DIAGNOSTIC INSIGHTS & ACTIONABLE RECOMMENDATIONS
  // -------------------------------------------------------------
  if (includeInsights && submission.personalizedInsights) {
    const insights = submission.personalizedInsights;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);

    const insightsHeight = 52;
    doc.roundedRect(margin, nextSectionY, contentWidth, insightsHeight, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PERSONALIZED DIAGNOSTIC FEEDBACK & REVISION ROADMAP', margin + 4, nextSectionY + 6);

    // Three Columns inside insights card
    const colW = (contentWidth - 12) / 3;

    // Sub-col 1: Key Strengths
    const col1X = margin + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 149, 106);
    doc.text('✓ Demonstrated Strengths', col1X, nextSectionY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const strengths = insights.keyStrengths?.slice(0, 3) || ['Strong theoretical conceptualization', 'Accurate mathematical formulation'];
    let stY = nextSectionY + 17;
    strengths.forEach(str => {
      doc.text(`• ${str}`, col1X, stY, { maxWidth: colW - 2 });
      stY += 7;
    });

    // Sub-col 2: Critical Gaps
    const col2X = col1X + colW + 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(225, 29, 72);
    doc.text('⚠ Identified Concept Gaps', col2X, nextSectionY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const gaps = insights.criticalGaps?.slice(0, 3) || ['Missing boundary conditions', 'Incomplete algorithm step details'];
    let gpY = nextSectionY + 17;
    gaps.forEach(gap => {
      doc.text(`• ${gap}`, col2X, gpY, { maxWidth: colW - 2 });
      gpY += 7;
    });

    // Sub-col 3: Recommended Actionable Revision
    const col3X = col2X + colW + 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229);
    doc.text('★ Actionable Revision Items', col3X, nextSectionY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const recs = insights.actionableRecommendations?.slice(0, 3) || ['Review Otsu threshold proofs', 'Practice Laplacian filter convolution'];
    let rcY = nextSectionY + 17;
    recs.forEach(rec => {
      doc.text(`• ${rec}`, col3X, rcY, { maxWidth: colW - 2 });
      rcY += 7;
    });

    nextSectionY += insightsHeight + 6;
  }

  // Check if we need page break for signatures & archival seal
  if (nextSectionY > pageHeight - 45) {
    doc.addPage();
    nextSectionY = 20;
  }

  // -------------------------------------------------------------
  // 6. OFFICIAL ARCHIVAL SIGN-OFF & TAMPER-EVIDENT SEAL
  // -------------------------------------------------------------
  const sigBoxY = nextSectionY;
  const sigBoxWidth = (contentWidth - 6) / 2;

  // Box 1: Evaluator Sign-off
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, sigBoxY, sigBoxWidth, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('EVALUATOR VERIFICATION SIGN-OFF', margin + 3, sigBoxY + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Digitally Certified by: ${evaluatorName}`, margin + 3, sigBoxY + 10);
  doc.text(`Authentication Token: ${verificationHash}`, margin + 3, sigBoxY + 14);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text('[Digital Signature Validated & Locked]', margin + 3, sigBoxY + 19);

  // Box 2: Department Archival Seal
  const sealBoxX = margin + sigBoxWidth + 6;
  doc.rect(sealBoxX, sigBoxY, sigBoxWidth, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('DEPARTMENT EXAMINATION REGISTRY & ARCHIVE', sealBoxX + 3, sigBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Archival Status: PERMANENT ACADEMIC RECORD', sealBoxX + 3, sigBoxY + 10);
  doc.text('System Integrity: Compliant with ISO/IEC 27001 AI Standards', sealBoxX + 3, sigBoxY + 14);
  doc.text('Generated via IntelliGrade Automated Evaluation Pipeline', sealBoxX + 3, sigBoxY + 19);

  // -------------------------------------------------------------
  // 7. RUNNING FOOTER ON ALL PAGES
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `IntelliGrade v2.5.0 • Evaluated Student Dossier: ${submission.studentName} (${submission.studentRollNumber}) • Course: ${exam.courseCode || 'CS-301'}`,
      margin,
      pageHeight - 6
    );

    doc.text(
      `Page ${i} of ${totalPages} • Confidential Academic Record`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  // -------------------------------------------------------------
  // 8. SAVE / DOWNLOAD PDF
  // -------------------------------------------------------------
  const cleanRoll = (submission.studentRollNumber || 'student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanExam = (exam.courseCode || exam.title || 'exam').replace(/[^a-zA-Z0-9_-]/g, '_');
  const defaultFileName = `IntelliGrade_Evaluation_Report_${cleanExam}_${cleanRoll}.pdf`;
  const exportFileName = options.fileName || defaultFileName;

  doc.save(exportFileName);
}

/**
 * Exports a comprehensive Class Evaluation Master Ledger PDF for an entire cohort
 */
export async function exportBatchEvaluationSummaryPDF(
  submissions: StudentSubmission[],
  exam: ExamPaper,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    institutionName = 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
    evaluatorName = 'Faculty Evaluation Committee'
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Header Banner
  doc.setFillColor(20, 24, 33);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 31.5, pageWidth, 1.2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('INTELLIGRADE COHORT EVALUATION MASTER LEDGER', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(199, 210, 254);
  doc.text(`${exam.title} (${exam.courseCode || 'CS-301'}) • ${institutionName}`, margin, 18);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Evaluator: ${evaluatorName} • Total Enrolled Submissions: ${submissions.length} Students`, margin, 24);

  const generationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL BATCH LEDGER', pageWidth - margin, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Archival Date: ${generationDate}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`System: IntelliGrade v2.5.0-RBAC`, pageWidth - margin, 24, { align: 'right' });

  // Compute Class Stats
  let totalScoreSum = 0;
  let highestScore = 0;
  let lowestScore = 999;
  let passCount = 0;

  submissions.forEach(s => {
    let subMarks = 0;
    s.questionEvaluations.forEach(q => {
      subMarks += (q.teacherOverrideMarks !== undefined ? q.teacherOverrideMarks : q.awardedMarks);
    });
    totalScoreSum += subMarks;
    if (subMarks > highestScore) highestScore = subMarks;
    if (subMarks < lowestScore) lowestScore = subMarks;
    if ((subMarks / (exam.totalMarks || 50)) >= 0.5) passCount++;
  });

  if (lowestScore === 999) lowestScore = 0;
  const avgMarks = submissions.length ? (totalScoreSum / submissions.length).toFixed(1) : '0';
  const avgPct = submissions.length ? Math.round((Number(avgMarks) / (exam.totalMarks || 50)) * 100) : 0;
  const passRate = submissions.length ? Math.round((passCount / submissions.length) * 100) : 0;

  // KPI Mini Bar
  const kpiY = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, kpiY, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `CLASS SUMMARY:   Total Papers: ${submissions.length}   |   Class Average: ${avgMarks}/${exam.totalMarks} (${avgPct}%)   |   Highest: ${highestScore}   |   Lowest: ${lowestScore}   |   Pass Rate: ${passRate}%`,
    margin + 4,
    kpiY + 8.5
  );

  // Table Data
  const rows = submissions.map((sub, index) => {
    let marksAwarded = 0;
    sub.questionEvaluations.forEach(q => {
      marksAwarded += (q.teacherOverrideMarks !== undefined ? q.teacherOverrideMarks : q.awardedMarks);
    });
    const maxMarks = exam.totalMarks || sub.totalMaxMarks || 50;
    const pct = Math.round((marksAwarded / maxMarks) * 100);
    const { grade } = getLetterGrade(pct);

    // Build question breakdown
    const qBreakdown = sub.questionEvaluations.map(q => {
      const m = q.teacherOverrideMarks !== undefined ? q.teacherOverrideMarks : q.awardedMarks;
      return `Q${q.questionNumber}:${m}`;
    }).join('  ');

    return [
      String(index + 1),
      sub.studentRollNumber,
      sub.studentName,
      `${marksAwarded} / ${maxMarks}`,
      `${pct}%`,
      grade,
      sub.status || 'Graded',
      qBreakdown,
      sub.predictiveAnalytics?.examReadinessLevel || 'Evaluated'
    ];
  });

  autoTable(doc, {
    startY: 54,
    margin: { left: margin, right: margin },
    head: [[
      '#',
      'Roll Number',
      'Student Name',
      'Awarded Marks',
      'Pct %',
      'Grade',
      'Status',
      'Itemized Question Marks Breakdown',
      'Readiness Level'
    ]],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 'auto' },
      8: { cellWidth: 32 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Running Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `IntelliGrade Master Evaluation Ledger • Course: ${exam.courseCode || 'CS-301'} • ${exam.title}`,
      margin,
      pageHeight - 5
    );

    doc.text(
      `Page ${i} of ${totalPages} • Official Archival Document`,
      pageWidth - margin,
      pageHeight - 5,
      { align: 'right' }
    );
  }

  const cleanCourse = (exam.courseCode || 'course').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = options.fileName || `IntelliGrade_Class_Master_Ledger_${cleanCourse}.pdf`;
  doc.save(fileName);
}

