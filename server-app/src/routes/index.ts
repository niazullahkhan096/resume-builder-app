import { Router } from 'express';

import { LatexService } from '../services';
import { ResumeController } from '../controllers';

const router = Router();

const latexService = new LatexService('resources/templates');
const resumeController = new ResumeController(latexService);

router.post(
    '/generate-resume', 
    (req, res) => resumeController.generateResume(req, res)
);

export default router;