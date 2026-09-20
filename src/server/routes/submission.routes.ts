import { Router } from 'express';
import { submissionController } from '../controllers/submission.controller';
import { evaluationController } from '../controllers/evaluation.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import {
  CreateSubmissionSchema,
  UpdateSubmissionStatusSchema,
  GradeOverrideSchema
} from '../dtos/submission.dto';

const router = Router();

router.get('/', requireAuth(), (req, res, next) => submissionController.getSubmissions(req, res, next));
router.post('/', requireAuth(), validateBody(CreateSubmissionSchema), (req, res, next) => submissionController.createSubmission(req, res, next));

// Pre-flight check & upload alias routes
router.get('/check-duplicate', (req, res, next) => submissionController.checkDuplicate(req, res, next));
router.post('/upload', (req, res, next) => submissionController.createSubmission(req, res, next));

// Secure file access routes
router.get('/files/:fileId/pages/:pageNumber', requireAuth(), (req, res, next) => submissionController.getSecureFilePage(req, res, next));
router.get('/files/:fileId/metadata', requireAuth(), (req, res, next) => submissionController.getSecureFileMetadata(req, res, next));

// Batch routes
router.post('/batch/process-pending', requireAuth(['teacher', 'admin']), (req, res, next) => submissionController.batchProcessPending(req, res, next));

// Pipeline lifecycle routes
router.post('/:id/process-pipeline', requireAuth(['teacher', 'admin', 'student']), (req, res, next) => submissionController.processPipeline(req, res, next));
router.get('/:id/pipeline', requireAuth(), (req, res, next) => submissionController.getPipeline(req, res, next));
router.post('/:id/retry-pipeline', requireAuth(['teacher', 'admin', 'student']), (req, res, next) => submissionController.retryPipeline(req, res, next));
router.post('/:id/test-ocr-failure', requireAuth(['teacher', 'admin', 'student']), (req, res, next) => submissionController.testOcrFailure(req, res, next));

// Individual submission CRUD
router.get('/:id', requireAuth(), (req, res, next) => submissionController.getSubmissionById(req, res, next));
router.patch('/:id/status', requireAuth(['teacher', 'admin']), validateBody(UpdateSubmissionStatusSchema), (req, res, next) => submissionController.updateStatus(req, res, next));
router.post('/:id/override', requireAuth(['teacher', 'admin']), validateBody(GradeOverrideSchema), (req, res, next) => submissionController.overrideScore(req, res, next));
router.post('/:id/reevaluate', requireAuth(['admin', 'teacher']), (req, res, next) => submissionController.reevaluate(req, res, next));
router.delete('/:id', requireAuth(['admin']), (req, res, next) => submissionController.deleteSubmission(req, res, next));

// Teacher evaluation review & finalization endpoints for submissions
router.get('/:id/evaluation', requireAuth(), (req, res, next) => evaluationController.getEvaluation(req, res, next));
router.get('/:id/evaluations', requireAuth(), (req, res, next) => evaluationController.getEvaluations(req, res, next));
router.put('/:id/evaluation', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.updateTeacherEvaluation(req, res, next));
router.post('/:id/evaluation/accept-ai', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.acceptAiSuggestion(req, res, next));
router.post('/:id/evaluation/modify-marks', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.modifyMarks(req, res, next));
router.post('/:id/evaluation/finalize', requireAuth(['teacher', 'admin']), (req, res, next) => evaluationController.finalizeEvaluation(req, res, next));

export default router;
