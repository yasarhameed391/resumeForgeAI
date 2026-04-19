import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resumeController.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  }
});

router.post('/upload', upload.single('resume'), resumeController.upload);
router.get('/', resumeController.getAll);
router.get('/:id', resumeController.getById);
router.delete('/:id', resumeController.delete);

export default router;