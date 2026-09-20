import { Request, Response, NextFunction } from 'express';
import { auditRepository } from '../repositories/audit.repository';
import { ApiResponse } from '../common/apiResponse';

export class AcademicController {
  async appealReevaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionNumber, reason, studentRollNo } = req.body;
      const ticketId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;

      await auditRepository.create({
        timestamp: new Date().toISOString(),
        userEmail: studentRollNo || req.user?.email || 'student@intelligrade.edu',
        userRole: 'student',
        action: 'REMARKING_APPEAL_SUBMITTED',
        resource: `Question ${questionNumber}: ${reason}`,
        status: 'Success'
      });

      ApiResponse.success(res, {
        ticketId,
        message: 'Re-evaluation appeal recorded. Assigned to instructor review queue.',
        status: 'Pending Instructor Review'
      });
    } catch (err) {
      next(err);
    }
  }

  async sendMockEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        recipientEmail,
        studentName,
        studentRollNumber,
        courseCode,
        examTitle,
        scoreAwarded,
        maxMarks,
        percentageScore,
        feedbackSummary,
        questionScores
      } = req.body;

      const dispatchId = `DISPATCH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const targetEmail = recipientEmail || `${studentName ? studentName.toLowerCase().replace(/\s+/g, '.') : 'student'}@university.edu`;

      await auditRepository.create({
        timestamp: new Date().toISOString(),
        userEmail: req.user?.email || 'teacher@intelligrade.edu',
        userRole: req.user?.role || 'teacher',
        action: 'MOCK_EMAIL_DISPATCH',
        resource: `Grading Complete Alert -> ${studentName || 'Student'} (${targetEmail})`,
        status: 'Success'
      });

      ApiResponse.success(res, {
        dispatchId,
        status: 'Delivered',
        timestamp: new Date().toISOString(),
        message: `Simulated 'Grading Complete' email notification dispatched to ${targetEmail}`,
        alert: {
          id: dispatchId,
          recipientEmail: targetEmail,
          studentName: studentName || 'Student',
          studentRollNumber: studentRollNumber || 'CS-2026-000',
          courseCode: courseCode || 'CS-301',
          examTitle: examTitle || 'Examination',
          scoreAwarded: Number(scoreAwarded) || 0,
          maxMarks: Number(maxMarks) || 0,
          percentageScore: Number(percentageScore) || 0,
          timestamp: new Date().toISOString(),
          status: 'Delivered',
          subject: `[IntelliGrade] Grading Complete: ${courseCode || 'CS-301'} ${examTitle || 'Exam'} Results Published`,
          feedbackSummary: feedbackSummary || 'Evaluation completed via IntelliGrade AI rubric engine.',
          questionScores: questionScores || []
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const academicController = new AcademicController();
