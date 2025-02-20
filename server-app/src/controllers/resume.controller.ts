import { Request, Response } from 'express';
import { LatexService } from '../services';

class ResumeController {
  private latexService: LatexService;

  constructor(latexService: LatexService) {
    this.latexService = latexService;
  }

  public async generateResume(req: Request, res: Response): Promise<void> {
    try {
      const resumeData = req.body;
      const latexDocument = await this.latexService.generateLatex('alta', resumeData);

      res.status(200).send(
        {
          fileName: "resume.tex",
          content: latexDocument
        }
      );
    } catch (error) {
      console.error('Error generating resume:', error);
      res.status(500).send({ error: 'Failed to generate LaTeX document' });
    }
  }
}

export default ResumeController;