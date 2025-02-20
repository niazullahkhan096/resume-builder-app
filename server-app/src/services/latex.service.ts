import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import * as fsExtra from 'fs-extra';


interface Templates {
  [templateName: string]: {
    [fileName: string]: string; // Maps file names to their content
  };
};

interface PersonalDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  languages: string[];
};

interface EducationDetails {
  university: string;
  degree: string;
  start_date: string;
  end_date: string;
  specialization: string;
};

interface CertificationDetails {
  name: string;
  organization: string;
  date: string;
};

interface ProfessionalDetails {
  job_title: string;
  job_type: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
};


class LatexService {
  private templates: Templates = {};
  private outputDir: string;


  constructor(private templatesDir: string) {
    this.loadTemplates();

    this.outputDir = path.join(__dirname, 'latex_output');
    fsExtra.ensureDirSync(this.outputDir);
  }

  public async generateLatexFile(content: string, outputFileName: string): Promise<string> {
    try {
      const filePath = path.join(__dirname, 'resume.tex');
      fs.writeFileSync(filePath, content);
      return filePath;
    } catch (error) {
      throw new Error(`Failed to generate LaTeX document: ${error}`);
    }
  }

  private compileLatex(texFilePath: string) {
    const texDir = path.dirname(texFilePath); // Get the directory of the .tex file
    const basename = path.basename(texFilePath);

    console.log("texDir:", texDir);
    console.log("basename:", basename);

    return new Promise((resolve, reject) => {
        exec(
            `pdflatex -interaction=nonstopmode -file-line-error -halt-on-error -output-directory=${this.outputDir} ${basename}`,
            { cwd: texDir }, // Set working directory
            (error, stdout, stderr) => {
                console.log("STDOUT:", stdout);
                console.log("STDERR:", stderr);
                if (error) {
                    console.error("LaTeX Compilation Error:", stderr);
                    reject("LaTeX compilation failed");
                } else {
                    resolve(path.join(texDir, "resume.pdf"));
                }
            }
        );
    });
  }

  //--------------------------------------------

  private loadTemplates(): void {
    const templateFolders = fs.readdirSync(this.templatesDir);

    templateFolders.forEach((folder) => {
      const folderPath = path.join(this.templatesDir, folder);

      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        this.templates[folder] = {};

        files.forEach((file) => {
          const filePath = path.join(folderPath, file);
          if (fs.statSync(filePath).isFile() && (file.endsWith('.tex') || file.endsWith('.cls'))) {
            this.templates[folder][file] = fs.readFileSync(filePath, 'utf-8');
          }
        });
      }
    });
  }

  private replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template;

    for (const key in data) {
      const placeholder = `\\\\VAR\\{${key}\\}`;
      result = result.replace(new RegExp(placeholder, 'g'), data[key] || '');
    }

    return result;
  }

  private generatePersonalDetailsSection(templateName: string, personalDetail: PersonalDetails | undefined): string {
    if (!personalDetail) {
      return '';
    }

    const personalDetailTemplate = this.templates[templateName]?.['personal_details_template.tex'];

    if (!personalDetailTemplate) {
      throw new Error('generatePersonalDetailsSection template not found.');
    }

    return this.replacePlaceholders(personalDetailTemplate, {
      first_name: personalDetail.first_name || '',
      last_name: personalDetail.last_name || '',
      email: personalDetail.email || '',
      phone: personalDetail.phone || '',
      address: personalDetail.address || '',
      linkedin: personalDetail.linkedin || '',
      github: personalDetail.github || '',
      languages: personalDetail.languages.map((lang) => `${lang}`).join(', ') || '',
    });
  }

  private generateEducationDetailsSection(templateName: string, educationDetailsList: EducationDetails[] | undefined): string {
    if (!educationDetailsList || educationDetailsList.length === 0) {
      return '';
    }

    const educationDetailContainerTemplate = this.templates[templateName]?.['education_details_container_template.tex'];
    const educationDetailItemTemplate = this.templates[templateName]?.['education_details_item_template.tex'];

    if (!educationDetailContainerTemplate || !educationDetailItemTemplate) {
      throw new Error('generateEducationDetailsSection template not found.');
    }

    const items = educationDetailsList
      .map((educationDetail) => {
        const data = {
          university: educationDetail.university || '',
          degree: educationDetail.degree || '',
          start_date: educationDetail.start_date || '',
          end_date: educationDetail.end_date || '',
          specialization: educationDetail.specialization || ''
        };
        return this.replacePlaceholders(educationDetailItemTemplate, data);
      })
      .join('\n');

    return this.replacePlaceholders(educationDetailContainerTemplate, {
      heading: 'Education',
      items: items || '',
    });
  }

  private generateSkillsDetailsSection(templateName: string, skillsDetails: any | undefined): string {
    if (!skillsDetails) {
      return '';
    }

    const skillsDetailContainerTemplate = this.templates[templateName]?.['skills_details_container_template.tex'];
    const skillsDetailItemTemplate = this.templates[templateName]?.['skills_details_item_template.tex'];

    if (!skillsDetailContainerTemplate || !skillsDetailItemTemplate) {
      throw new Error('generateSkillsDetailsSection template not found.');
    }

    const skillsDetailsList = Object.values(skillsDetails).flat() as string[];

    const items = skillsDetailsList
      .map((skill) => {
        return this.replacePlaceholders(skillsDetailItemTemplate, {
          skill: skill
        });
      })
      .join('\n');

    return this.replacePlaceholders(skillsDetailContainerTemplate, {
      heading: 'Skills',
      items: items || '',
    });
  }

  private generateProfessionalSummarySection(templateName: string, professionalSummaryList: string[] | undefined): string {
    if (!professionalSummaryList || professionalSummaryList.length === 0) {
      return '';
    }

    const professionalSummaryContainerTemplate = this.templates[templateName]?.['professional_summary_container_template.tex'];
    const professionalSummaryItemTemplate = this.templates[templateName]?.['professional_summary_item_template.tex'];

    if (!professionalSummaryContainerTemplate || !professionalSummaryItemTemplate) {
      throw new Error('generateProfessionalSummarySection template not found.');
    }

    const items = professionalSummaryList
      .map((professionalSummary) => {
        return this.replacePlaceholders(professionalSummaryItemTemplate, {
          professional_summary: professionalSummary
        });
      })
      .join('\n');

    return this.replacePlaceholders(professionalSummaryContainerTemplate, {
      heading: 'Professional Summary',
      items: items || '',
    });
  }

  private generateProfessionalDetailsSection(templateName: string, professionalDetailsList: ProfessionalDetails[] | undefined): string {
    if (!professionalDetailsList || professionalDetailsList.length === 0) {
      return '';
    }

    const professionalDetailContainerTemplate = this.templates[templateName]?.['professional_details_container_template.tex'];
    const professionalDetailItemTemplate = this.templates[templateName]?.['professional_details_item_template.tex'];

    if (!professionalDetailContainerTemplate || !professionalDetailItemTemplate) {
      throw new Error('Experience template not found.');
    }

    const items = professionalDetailsList
      .map((professionalDetail) => {
        const responsibilities = (professionalDetail.responsibilities || [])
          .map((responsibility) => `${responsibility}`)
          .join('\n');

        const data = {
          job_title: professionalDetail.job_title || '',
          job_type: professionalDetail.job_type || '',
          company_name: professionalDetail.company_name || '',
          location: professionalDetail.location || '',
          start_date: professionalDetail.start_date || '',
          end_date: professionalDetail.end_date || '',
          responsibilities: responsibilities || '',
        };
        return this.replacePlaceholders(professionalDetailItemTemplate, data);
      })
      .join('\n');

    return this.replacePlaceholders(professionalDetailContainerTemplate, {
      heading: 'Experience',
      items: items || '',
    });
  }

  private generateCertificationDetailsSection(templateName: string, certificationDetailsList: CertificationDetails[] | undefined): string {
    if (!certificationDetailsList || certificationDetailsList.length === 0) {
      return '';
    }

    const certificationDetailContainerTemplate = this.templates[templateName]?.['certification_details_container_template.tex'];
    const certificationDetailItemTemplate = this.templates[templateName]?.['certification_details_item_template.tex'];

    if (!certificationDetailContainerTemplate || !certificationDetailItemTemplate) {
      throw new Error('generateCertificationDetailsSection template not found.');
    }

    const items = certificationDetailsList
      .map((certificationDetail) => {
        const data = {
          name: certificationDetail.name || '',
          organization: certificationDetail.organization || '',
          date: certificationDetail.date || '',
        };
        return this.replacePlaceholders(certificationDetailItemTemplate, data);
      })
      .join('\n');

    return this.replacePlaceholders(certificationDetailContainerTemplate, {
      heading: 'Certifications',
      items: items || '',
    });
  }

  private generateAchievementsSummarySection(templateName: string, achievementsSummaryList: string[] | undefined): string {
    if (!achievementsSummaryList || achievementsSummaryList.length === 0) {
      return '';
    }

    const achievementsSummaryContainerTemplate = this.templates[templateName]?.['achievements_summary_container_template.tex'];
    const achievementsSummaryItemTemplate = this.templates[templateName]?.['achievements_summary_item_template.tex'];

    if (!achievementsSummaryContainerTemplate || !achievementsSummaryItemTemplate) {
      throw new Error('generateAchievementsSummarySection template not found.');
    }

    const items = achievementsSummaryList
      .map((achievementsSummary) => {
        return this.replacePlaceholders(achievementsSummaryItemTemplate, {
          achievements_summary: achievementsSummary
        });
      })
      .join('\n');

    return this.replacePlaceholders(achievementsSummaryContainerTemplate, {
      heading: 'Achievements',
      items: items || '',
    });
  }

  public async generateLatex(templateName: string, data: any): Promise<string> {
    const templateFiles = this.templates[templateName];

    if (!templateFiles || !templateFiles['main_template.tex']) {
      throw new Error(`Template "${templateName}" or main_template.tex not found.`);
    }

    const mainTemplate = templateFiles['main_template.tex'];

    const personalDetailsSection = this.generatePersonalDetailsSection(
      templateName,
      data.personal_details
    );

    const educationDetailsSection = this.generateEducationDetailsSection(
      templateName,
      data.education_details
    );

    const skillsDetailsSection = this.generateSkillsDetailsSection(
      templateName,
      data.skills_details
    );

    const professionalSummarySection = this.generateProfessionalSummarySection(
      templateName,
      data.professional_summary
    );

    const professionalDetailsSection = this.generateProfessionalDetailsSection(
      templateName,
      data.professional_details
    );

    const certificationDetailsSection = this.generateCertificationDetailsSection(
      templateName,
      data.certification_details
    );

    const achievementsSummarySection = this.generateAchievementsSummarySection(
      templateName,
      data.summary_of_achievements
    );


    const processedData = {
      personal_details: personalDetailsSection,
      education_details: educationDetailsSection,
      skills_details: skillsDetailsSection,
      professional_summary: professionalSummarySection,
      professional_details: professionalDetailsSection,
      certification_details: certificationDetailsSection,
      achievements_summary: achievementsSummarySection
    };

    const latexDocument = this.replacePlaceholders(mainTemplate, processedData as Record<string, string>);

    const texFilePath = await this.generateLatexFile(latexDocument, 'resume');
    console.log('texFilePath: ', texFilePath);
    const cmdResult = await this.compileLatex(texFilePath);

    return latexDocument;
  }
}

export default LatexService;
