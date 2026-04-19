import { Router } from 'express';
import { jobController } from '../controllers/jobController.js';

const router = Router();

router.post('/', jobController.create);
router.get('/', jobController.getAll);
router.get('/:id', jobController.getById);
router.delete('/:id', jobController.delete);

export default router;