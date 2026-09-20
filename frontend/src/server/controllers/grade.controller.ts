import { Request, Response, NextFunction } from 'express';
import { gradeService } from '../services/grade.service';
import { ApiResponse } from '../common/apiResponse';

export class GradeController {
  async evaluate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questions = [], studentAnswers = [], studentName = 'Student' } = req.body;
      const result = await gradeService.evaluateAnswers(questions, studentAnswers, studentName);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async reviewAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId, teacherAdjustedMarks, teacherComment = '', finalize = true } = req.body;
      const user = req.user;

      ApiResponse.success(res, {
        questionId,
        teacherAdjustedMarks: Number(teacherAdjustedMarks),
        finalMarks: finalize ? Number(teacherAdjustedMarks) : null,
        evaluationStatus: finalize ? 'TEACHER_FINALIZED' : 'TEACHER_REVIEWED',
        teacherComment,
        teacherReviewedAt: new Date().toISOString(),
        teacherReviewedBy: user?.name || user?.email || 'Faculty Evaluator'
      });
    } catch (err) {
      next(err);
    }
  }

  async finalizeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submissionId, evaluations = [] } = req.body;
      const user = req.user;

      const finalizedEvaluations = evaluations.map((ev: any) => {
        const finalScore = ev.teacherAdjustedMarks !== null && ev.teacherAdjustedMarks !== undefined
          ? Number(ev.teacherAdjustedMarks)
          : Number(ev.aiSuggestedMarks ?? ev.awardedMarks ?? 0);

        return {
          ...ev,
          teacherAdjustedMarks: finalScore,
          finalMarks: finalScore,
          evaluationStatus: 'TEACHER_FINALIZED',
          awardedMarks: finalScore,
          teacherOverrideMarks: finalScore,
          teacherReviewedAt: new Date().toISOString(),
          teacherReviewedBy: user?.name || user?.email || 'Faculty Evaluator'
        };
      });

      const totalFinalMarks = finalizedEvaluations.reduce((sum: number, e: any) => sum + (e.finalMarks || 0), 0);

      ApiResponse.success(res, {
        submissionId,
        isFullyFinalized: true,
        totalFinalMarks: Number(totalFinalMarks.toFixed(1)),
        evaluations: finalizedEvaluations,
        finalizedAt: new Date().toISOString(),
        finalizedBy: user?.name || user?.email || 'Faculty Evaluator'
      });
    } catch (err) {
      next(err);
    }
  }

  async generateModelAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionText, topic, maxMarks = 10, difficulty = 'Medium' } = req.body;
      const result = await gradeService.generateModelAnswer(questionText, topic, maxMarks, difficulty);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const gradeController = new GradeController();
