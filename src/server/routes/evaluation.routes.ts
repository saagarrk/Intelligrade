import { Router } from 'express';
import { evaluationController } from '../controllers/evaluation.controller';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

/**
 * Evaluation Routes:
 * - GET evaluation (authenticated: students own only; teachers/admins all)
 * - PUT/update teacher evaluation (teachers/admins only; students FORBIDDEN)
 * - POST accept AI suggestion (teachers/admins only; students FORBIDDEN)
 * - POST modify marks (teachers/admins only; students FORBIDDEN)
 * - POST finalize evaluation (teachers/admins only; students FORBIDDEN)
 */

// GET evaluation(s)
router.get('/', optionalAuth(), (req, res, next) => evaluationController.getEvaluations(req, res, next));
router.get('/:id', optionalAuth(), (req, res, next) => evaluationController.getEvaluation(req, res, next));

// PUT/update teacher evaluation
router.put('/:id', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.updateTeacherEvaluation(req, res, next));

// POST accept AI suggestion
router.post('/:id/accept-ai', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.acceptAiSuggestion(req, res, next));
router.post('/:id/accept-ai-suggestion', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.acceptAiSuggestion(req, res, next));

// POST modify marks
router.post('/:id/modify-marks', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.modifyMarks(req, res, next));

// POST finalize evaluation
router.post('/:id/finalize', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.finalizeEvaluation(req, res, next));

export default router;
