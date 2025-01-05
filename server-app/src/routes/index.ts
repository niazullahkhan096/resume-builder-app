import { Router } from 'express';
import { resumeController } from '../controllers';

const router = Router();

router.get('/example', resumeController.getExample);

export default router;