/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Virtual Career Platform
 * 
 * AI-Powered Career Services that exceed physical career centers
 * Features:
 * - 24/7 access (vs 9-5 at universities)
 * - Global job market (vs local)
 * - AI resume builder
 * - Virtual career fairs
 * - Industry connections
 * - Skill gap analysis
 */

import { EventEmitter } from 'events';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  skills: string[];
  category: string[];
  postedDate: Date;
  applicationDeadline?: Date;
  applicationUrl: string;
  companyLogo?: string;
}

export interface Resume {
  id: string;
  userId: string;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string[];
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  format: 'ats-friendly' | 'creative' | 'traditional';
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillGap {
  skill: string;
  currentLevel: number; // 0-5
  requiredLevel: number; // 0-5
  gap: number;
  recommendations: string[];
  learningResources: Array<{
    title: string;
    type: 'course' | 'book' | 'video' | 'article';
    url: string;
  }>;
}

export interface CareerFair {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'virtual' | 'hybrid';
  companies: Array<{
    id: string;
    name: string;
    logo?: string;
    boothUrl?: string;
    representatives: Array<{
      name: string;
      title: string;
      avatar?: string;
    }>;
  }>;
  registeredUsers: Set<string>;
  live: boolean;
}

export class VirtualCareerPlatform extends EventEmitter {
  private jobs: Map<string, Job> = new Map();
  private resumes: Map<string, Resume> = new Map();
  private careerFairs: Map<string, CareerFair> = new Map();
  private userApplications: Map<string, Set<string>> = new Map(); // userId -> jobIds

  constructor() {
    super();
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    // Sample jobs from global market
    const sampleJobs: Job[] = [
      {
        id: 'job-001',
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        type: 'full-time',
        salary: { min: 80000, max: 120000, currency: 'USD' },
        description: 'Build innovative software solutions...',
        requirements: ['Bachelor\'s in CS', '3+ years experience', 'JavaScript', 'React'],
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        category: ['Technology', 'Software Development'],
        postedDate: new Date(),
        applicationUrl: '/jobs/job-001/apply',
      },
      // Add more sample jobs...
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));
  }

  /**
   * Search jobs with AI matching
   */
  async searchJobs(query: {
    keywords?: string;
    location?: string;
    type?: string;
    category?: string[];
    salaryMin?: number;
    skills?: string[];
    userId?: string; // For personalized results
  }): Promise<Job[]> {
    let results = Array.from(this.jobs.values());

    // Apply filters
    if (query.keywords) {
      const keywords = query.keywords.toLowerCase();
      results = results.filter(job =>
        job.title.toLowerCase().includes(keywords) ||
        job.description.toLowerCase().includes(keywords) ||
        job.company.toLowerCase().includes(keywords)
      );
    }

    if (query.location) {
      results = results.filter(job =>
        job.location.toLowerCase().includes(query.location!.toLowerCase())
      );
    }

    if (query.type) {
      results = results.filter(job => job.type === query.type);
    }

    if (query.category && query.category.length > 0) {
      results = results.filter(job =>
        query.category!.some(cat => job.category.includes(cat))
      );
    }

    if (query.salaryMin) {
      results = results.filter(job =>
        job.salary && job.salary.min >= query.salaryMin!
      );
    }

    if (query.skills && query.skills.length > 0) {
      results = results.filter(job =>
        query.skills!.some(skill =>
          job.skills.some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // AI-powered personalization
    if (query.userId) {
      results = await this.personalizeJobResults(query.userId, results);
    }

    this.emit('jobSearch', { query, resultCount: results.length });
    return results;
  }

  /**
   * AI-powered job personalization
   */
  private async personalizeJobResults(userId: string, jobs: Job[]): Promise<Job[]> {
    // In production, this would:
    // - Analyze user's resume
    // - Match skills to job requirements
    // - Consider user's career goals
    // - Use ML to rank jobs by fit

    const userResume = this.resumes.get(userId);
    if (!userResume) {
      return jobs; // No personalization without resume
    }

    // Score jobs based on skill match
    const scoredJobs = jobs.map(job => {
      let score = 0;
      const userSkills = userResume.skills.map(s => s.toLowerCase());

      job.skills.forEach(jobSkill => {
        if (userSkills.some(userSkill => userSkill.includes(jobSkill.toLowerCase()))) {
          score += 1;
        }
      });

      return { job, score };
    });

    return scoredJobs
      .sort((a, b) => b.score - a.score)
      .map(item => item.job);
  }

  /**
   * AI Resume Builder
   */
  async buildResume(userId: string, data: Partial<Resume>): Promise<Resume> {
    // AI optimizes resume for ATS (Applicant Tracking Systems)
    const resume: Resume = {
      id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      personalInfo: data.personalInfo || {
        name: '',
        email: '',
      },
      summary: data.summary || '',
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      format: data.format || 'ats-friendly',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // AI optimization
    resume.summary = await this.optimizeSummary(resume);
    resume.experience = await this.optimizeExperience(resume.experience);

    this.resumes.set(userId, resume);
    this.emit('resumeCreated', resume);
    return resume;
  }

  /**
   * AI optimize resume summary
   */
  private async optimizeSummary(resume: Resume): Promise<string> {
    // In production, AI would generate optimized summary
    if (resume.summary) {
      return resume.summary; // Use existing if provided
    }

    // Generate from experience and skills
    const skills = resume.skills.join(', ');
    const experience = resume.experience.map(exp => exp.title).join(', ');
    return `Experienced professional with expertise in ${skills}. ${experience}`;
  }

  /**
   * AI optimize experience descriptions
   */
  private async optimizeExperience(experience: Resume['experience']): Promise<Resume['experience']> {
    // In production, AI would:
    // - Use action verbs
    // - Quantify achievements
    // - Optimize for ATS keywords

    return experience.map(exp => ({
      ...exp,
      description: exp.description.map(desc => {
        // Ensure action verbs at start
        if (!/^(achieved|implemented|developed|managed|led|created|improved|optimized|designed|built)/i.test(desc)) {
          return `Achieved ${desc}`;
        }
        return desc;
      }),
    }));
  }

  /**
   * Analyze skill gaps
   */
  async analyzeSkillGaps(userId: string, targetJobId: string): Promise<SkillGap[]> {
    const userResume = this.resumes.get(userId);
    const targetJob = this.jobs.get(targetJobId);

    if (!userResume || !targetJob) {
      throw new Error('Resume or job not found');
    }

    const userSkills = new Map<string, number>();
    userResume.skills.forEach(skill => {
      userSkills.set(skill.toLowerCase(), 3); // Default level 3
    });

    const gaps: SkillGap[] = [];

    targetJob.skills.forEach(requiredSkill => {
      const skillLower = requiredSkill.toLowerCase();
      const currentLevel = userSkills.get(skillLower) || 0;
      const requiredLevel = 4; // Typically require level 4+

      if (currentLevel < requiredLevel) {
        gaps.push({
          skill: requiredSkill,
          currentLevel,
          requiredLevel,
          gap: requiredLevel - currentLevel,
          recommendations: [
            `Take online courses in ${requiredSkill}`,
            `Build projects using ${requiredSkill}`,
            `Get certified in ${requiredSkill}`,
          ],
          learningResources: [
            {
              title: `${requiredSkill} Fundamentals Course`,
              type: 'course',
              url: `/courses/${skillLower}`,
            },
          ],
        });
      }
    });

    this.emit('skillGapAnalyzed', { userId, targetJobId, gaps });
    return gaps;
  }

  /**
   * Apply for job
   */
  async applyForJob(userId: string, jobId: string, resumeId?: string): Promise<{ success: boolean; applicationId: string }> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const resume = resumeId
      ? Array.from(this.resumes.values()).find(r => r.id === resumeId && r.userId === userId)
      : this.resumes.get(userId);

    if (!resume) {
      throw new Error('Resume not found. Please create a resume first.');
    }

    // Track application
    const userApplications = this.userApplications.get(userId) || new Set();
    userApplications.add(jobId);
    this.userApplications.set(userId, userApplications);

    const applicationId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.emit('jobApplied', { userId, jobId, applicationId, resumeId: resume.id });
    return { success: true, applicationId };
  }

  /**
   * Create virtual career fair
   */
  createCareerFair(fair: Omit<CareerFair, 'id' | 'registeredUsers' | 'live'>): CareerFair {
    const careerFair: CareerFair = {
      ...fair,
      id: `fair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      registeredUsers: new Set(),
      live: false,
    };

    this.careerFairs.set(careerFair.id, careerFair);
    this.emit('careerFairCreated', careerFair);
    return careerFair;
  }

  /**
   * Register for career fair
   */
  registerForCareerFair(userId: string, fairId: string): void {
    const fair = this.careerFairs.get(fairId);
    if (!fair) {
      throw new Error('Career fair not found');
    }

    fair.registeredUsers.add(userId);
    this.emit('careerFairRegistered', { userId, fairId });
  }

  /**
   * Start career fair (make it live)
   */
  startCareerFair(fairId: string): void {
    const fair = this.careerFairs.get(fairId);
    if (!fair) {
      throw new Error('Career fair not found');
    }

    fair.live = true;
    this.emit('careerFairStarted', fair);
  }

  /**
   * Get user's applications
   */
  getUserApplications(userId: string): Job[] {
    const userApplications = this.userApplications.get(userId) || new Set();
    return Array.from(userApplications)
      .map(jobId => this.jobs.get(jobId))
      .filter((job): job is Job => job !== undefined);
  }

  /**
   * Get user's resume
   */
  getUserResume(userId: string): Resume | undefined {
    return this.resumes.get(userId);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalJobs: number;
    totalResumes: number;
    totalCareerFairs: number;
    liveCareerFairs: number;
    totalApplications: number;
  } {
    return {
      totalJobs: this.jobs.size,
      totalResumes: this.resumes.size,
      totalCareerFairs: this.careerFairs.size,
      liveCareerFairs: Array.from(this.careerFairs.values())
        .filter(fair => fair.live).length,
      totalApplications: Array.from(this.userApplications.values())
        .reduce((sum, apps) => sum + apps.size, 0),
    };
  }
}

export const virtualCareerPlatform = new VirtualCareerPlatform();
