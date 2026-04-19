import { Router } from 'express';
import { atsController } from '../controllers/atsController.js';

const router = Router();

router.post('/analyze', atsController.analyze);
router.get('/history', atsController.getHistory);
router.get('/:id', atsController.getReport);
router.post('/tailor', atsController.tailor);
router.post('/save', atsController.save);

export default router;