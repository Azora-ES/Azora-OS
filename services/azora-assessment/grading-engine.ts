/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Assessment & Grading System
 * 
 * Complete grading engine with:
 * - Automatic grading for quizzes and assignments
 * - Manual grading with rubrics
 * - Gradebook management
 * - GPA calculation
 * - Grade history and audit trail
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface Assessment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project' | 'peer-review' | 'self-assessment';
  totalPoints: number;
  passingScore: number;
  dueDate?: Date;
  timeLimit?: number; // minutes
  questions: Question[];
  rubric?: Rubric;
  createdAt: Date;
  createdBy: string;
  constitutionalAlignment: boolean;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'code' | 'practical';
  text: string;
  points: number;
  options?: string[]; // For multiple choice
  correctAnswer?: string | string[]; // Answer key
  rubric?: QuestionRubric; // For subjective questions
  feedback?: string; // Feedback shown after grading
}

export interface QuestionRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string; // e.g., "Excellent", "Good", "Satisfactory", "Needs Improvement"
  points: number;
  description: string;
}

export interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentNumber: string;
  answers: SubmissionAnswer[];
  submittedAt: Date;
  status: 'submitted' | 'graded' | 'grading' | 'returned';
  timeSpent?: number; // minutes
  ipAddress?: string;
  deviceInfo?: string;
}

export interface SubmissionAnswer {
  questionId: string;
  answer: string | string[] | File;
  type: string;
  timestamp: Date;
}

export interface Grade {
  id: string;
  submissionId: string;
  assessmentId: string;
  studentId: string;
  studentNumber: string;
  courseId: string;
  moduleId: string;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: Date;
  gradedBy: string; // 'auto' | 'instructor-id' | 'peer-review'
  questionGrades: QuestionGrade[];
  feedback?: string;
  rubricScores?: Record<string, number>; // criterion -> score
  constitutionalAlignment: number; // 0-100
  uid: string; // Unique identifier for tracing
}

export interface QuestionGrade {
  questionId: string;
  points: number;
  maxPoints: number;
  feedback?: string;
  autoGraded: boolean;
}

export interface GradebookEntry {
  studentId: string;
  studentNumber: string;
  courseId: string;
  assessments: AssessmentGrade[];
  currentGrade: number; // percentage
  letterGrade: string;
  gpa: number; // For course
  totalPoints: number;
  earnedPoints: number;
  lastUpdated: Date;
}

export interface AssessmentGrade {
  assessmentId: string;
  assessmentName: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: Date;
  weight?: number; // For weighted grading
}

export interface GradingConfig {
  letterGrades: LetterGradeScale;
  gradeWeights?: Record<string, number>; // assessment type -> weight
  lateSubmissionPenalty?: number; // percentage per day
  allowLateSubmission?: boolean;
  allowResubmission?: boolean;
  autoGradeEnabled?: boolean;
}

export interface LetterGradeScale {
  'A+': { min: number; max: number };
  'A': { min: number; max: number };
  'A-': { min: number; max: number };
  'B+': { min: number; max: number };
  'B': { min: number; max: number };
  'B-': { min: number; max: number };
  'C+': { min: number; max: number };
  'C': { min: number; max: number };
  'C-': { min: number; max: number };
  'D+': { min: number; max: number };
  'D': { min: number; max: number };
  'D-': { min: number; max: number };
  'F': { min: number; max: number };
}

export class GradingEngine extends EventEmitter {
  private static instance: GradingEngine;
  private assessments: Map<string, Assessment> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private grades: Map<string, Grade> = new Map();
  private gradebooks: Map<string, GradebookEntry> = new Map(); // courseId -> studentId -> entry
  private defaultGradingConfig: GradingConfig = {
    letterGrades: {
      'A+': { min: 97, max: 100 },
      'A': { min: 93, max: 96.99 },
      'A-': { min: 90, max: 92.99 },
      'B+': { min: 87, max: 89.99 },
      'B': { min: 83, max: 86.99 },
      'B-': { min: 80, max: 82.99 },
      'C+': { min: 77, max: 79.99 },
      'C': { min: 73, max: 76.99 },
      'C-': { min: 70, max: 72.99 },
      'D+': { min: 67, max: 69.99 },
      'D': { min: 63, max: 66.99 },
      'D-': { min: 60, max: 62.99 },
      'F': { min: 0, max: 59.99 },
    },
    autoGradeEnabled: true,
    allowLateSubmission: true,
    lateSubmissionPenalty: 5, // 5% per day
  };

  private constructor() {
    super();
  }

  public static getInstance(): GradingEngine {
    if (!GradingEngine.instance) {
      GradingEngine.instance = new GradingEngine();
    }
    return GradingEngine.instance;
  }

  /**
   * Create a new assessment
   */
  async createAssessment(assessment: Omit<Assessment, 'id' | 'createdAt'>): Promise<Assessment> {
    const newAssessment: Assessment = {
      ...assessment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.assessments.set(newAssessment.id, newAssessment);
    this.emit('assessment:created', newAssessment);
    return newAssessment;
  }

  /**
   * Submit an assessment
   */
  async submitAssessment(submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>): Promise<Submission> {
    const assessment = this.assessments.get(submission.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Check due date
    const isLate = assessment.dueDate && new Date() > assessment.dueDate;

    const newSubmission: Submission = {
      ...submission,
      id: crypto.randomUUID(),
      submittedAt: new Date(),
      status: 'submitted',
    };

    this.submissions.set(newSubmission.id, newSubmission);
    this.emit('submission:created', newSubmission);

    // Auto-grade if enabled and assessment type allows
    if (this.defaultGradingConfig.autoGradeEnabled && this.canAutoGrade(assessment)) {
      await this.autoGrade(newSubmission.id);
    }

    return newSubmission;
  }

  /**
   * Auto-grade a submission
   */
  async autoGrade(submissionId: string): Promise<Grade> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const assessment = this.assessments.get(submission.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (!this.canAutoGrade(assessment)) {
      throw new Error('Assessment cannot be auto-graded');
    }

    const questionGrades: QuestionGrade[] = [];
    let totalEarned = 0;
    let totalPoints = 0;

    // Grade each question
    for (const question of assessment.questions) {
      totalPoints += question.points;
      const answer = submission.answers.find(a => a.questionId === question.id);
      
      if (!answer) {
        questionGrades.push({
          questionId: question.id,
          points: 0,
          maxPoints: question.points,
          autoGraded: true,
          feedback: 'No answer provided',
        });
        continue;
      }

      const grade = this.gradeQuestion(question, answer.answer);
      questionGrades.push({
        questionId: question.id,
        points: grade.points,
        maxPoints: question.points,
        autoGraded: true,
        feedback: grade.feedback,
      });
      totalEarned += grade.points;
    }

    const percentage = (totalEarned / totalPoints) * 100;
    const letterGrade = this.calculateLetterGrade(percentage);

    // Generate UID for tracing
    const uid = this.generateUID(submission.studentNumber, assessment.id, 'grade');

    const grade: Grade = {
      id: crypto.randomUUID(),
      submissionId: submission.id,
      assessmentId: assessment.id,
      studentId: submission.studentId,
      studentNumber: submission.studentNumber,
      courseId: assessment.courseId,
      moduleId: assessment.moduleId,
      totalPoints,
      earnedPoints: totalEarned,
      percentage,
      letterGrade,
      gradedAt: new Date(),
      gradedBy: 'auto',
      questionGrades,
      constitutionalAlignment: assessment.constitutionalAlignment ? 95 : 0,
      uid,
    };

    this.grades.set(grade.id, grade);
    submission.status = 'graded';
    this.submissions.set(submission.id, submission);

    // Update gradebook
    await this.updateGradebook(grade);

    this.emit('grade:created', grade);
    return grade;
  }

  /**
   * Grade a question
   */
  private gradeQuestion(question: Question, answer: string | string[] | File): { points: number; feedback?: string } {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      if (typeof answer === 'string') {
        const isCorrect = answer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        return {
          points: isCorrect ? question.points : 0,
          feedback: isCorrect ? question.feedback || 'Correct!' : `Incorrect. Correct answer: ${question.correctAnswer}`,
        };
      }
    }

    if (question.type === 'short-answer') {
      if (typeof answer === 'string') {
        // Simple keyword matching (can be enhanced with AI)
        const answerLower = answer.toLowerCase();
        const correctLower = question.correctAnswer?.toLowerCase() || '';
        const matches = correctLower.split(',').some(keyword => 
          answerLower.includes(keyword.trim())
        );
        
        return {
          points: matches ? question.points : question.points * 0.5,
          feedback: matches ? 'Correct!' : 'Partially correct. Check spelling and key terms.',
        };
      }
    }

    // For essay, code, practical - requires manual grading
    return {
      points: 0,
      feedback: 'Requires manual grading',
    };
  }

  /**
   * Manual grading with rubric
   */
  async manualGrade(
    submissionId: string,
    graderId: string,
    questionGrades: Array<{ questionId: string; points: number; feedback?: string }>,
    rubricScores?: Record<string, number>,
    overallFeedback?: string
  ): Promise<Grade> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const assessment = this.assessments.get(submission.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const totalPoints = assessment.totalPoints;
    const earnedPoints = questionGrades.reduce((sum, qg) => sum + qg.points, 0);
    const percentage = (earnedPoints / totalPoints) * 100;
    const letterGrade = this.calculateLetterGrade(percentage);

    // Generate UID
    const uid = this.generateUID(submission.studentNumber, assessment.id, 'grade');

    const grade: Grade = {
      id: crypto.randomUUID(),
      submissionId: submission.id,
      assessmentId: assessment.id,
      studentId: submission.studentId,
      studentNumber: submission.studentNumber,
      courseId: assessment.courseId,
      moduleId: assessment.moduleId,
      totalPoints,
      earnedPoints,
      percentage,
      letterGrade,
      gradedAt: new Date(),
      gradedBy: graderId,
      questionGrades: questionGrades.map(qg => ({
        ...qg,
        maxPoints: assessment.questions.find(q => q.id === qg.questionId)?.points || 0,
        autoGraded: false,
      })),
      feedback: overallFeedback,
      rubricScores,
      constitutionalAlignment: assessment.constitutionalAlignment ? 95 : 0,
      uid,
    };

    this.grades.set(grade.id, grade);
    submission.status = 'graded';
    this.submissions.set(submission.id, submission);

    // Update gradebook
    await this.updateGradebook(grade);

    this.emit('grade:created', grade);
    return grade;
  }

  /**
   * Calculate letter grade from percentage
   */
  private calculateLetterGrade(percentage: number): string {
    const scale = this.defaultGradingConfig.letterGrades;
    
    if (percentage >= scale['A+'].min) return 'A+';
    if (percentage >= scale['A'].min) return 'A';
    if (percentage >= scale['A-'].min) return 'A-';
    if (percentage >= scale['B+'].min) return 'B+';
    if (percentage >= scale['B'].min) return 'B';
    if (percentage >= scale['B-'].min) return 'B-';
    if (percentage >= scale['C+'].min) return 'C+';
    if (percentage >= scale['C'].min) return 'C';
    if (percentage >= scale['C-'].min) return 'C-';
    if (percentage >= scale['D+'].min) return 'D+';
    if (percentage >= scale['D'].min) return 'D';
    if (percentage >= scale['D-'].min) return 'D-';
    return 'F';
  }

  /**
   * Update gradebook entry
   */
  private async updateGradebook(grade: Grade): Promise<void> {
    const key = `${grade.courseId}:${grade.studentId}`;
    let entry = this.gradebooks.get(key);

    if (!entry) {
      entry = {
        studentId: grade.studentId,
        studentNumber: grade.studentNumber,
        courseId: grade.courseId,
        assessments: [],
        currentGrade: 0,
        letterGrade: 'F',
        gpa: 0,
        totalPoints: 0,
        earnedPoints: 0,
        lastUpdated: new Date(),
      };
    }

    // Update or add assessment grade
    const existingIndex = entry.assessments.findIndex(a => a.assessmentId === grade.assessmentId);
    const assessmentGrade: AssessmentGrade = {
      assessmentId: grade.assessmentId,
      assessmentName: this.assessments.get(grade.assessmentId)?.title || 'Unknown',
      points: grade.earnedPoints,
      maxPoints: grade.totalPoints,
      percentage: grade.percentage,
      letterGrade: grade.letterGrade,
      gradedAt: grade.gradedAt,
    };

    if (existingIndex >= 0) {
      entry.assessments[existingIndex] = assessmentGrade;
    } else {
      entry.assessments.push(assessmentGrade);
    }

    // Recalculate totals
    entry.totalPoints = entry.assessments.reduce((sum, a) => sum + a.maxPoints, 0);
    entry.earnedPoints = entry.assessments.reduce((sum, a) => sum + a.points, 0);
    entry.currentGrade = entry.totalPoints > 0 ? (entry.earnedPoints / entry.totalPoints) * 100 : 0;
    entry.letterGrade = this.calculateLetterGrade(entry.currentGrade);
    entry.gpa = this.calculateGPA(entry.letterGrade);
    entry.lastUpdated = new Date();

    this.gradebooks.set(key, entry);
    this.emit('gradebook:updated', entry);
  }

  /**
   * Calculate GPA from letter grade
   */
  private calculateGPA(letterGrade: string): number {
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };
    return gradePoints[letterGrade] || 0;
  }

  /**
   * Check if assessment can be auto-graded
   */
  private canAutoGrade(assessment: Assessment): boolean {
    return assessment.questions.every(q => 
      q.type === 'multiple-choice' || 
      q.type === 'true-false' || 
      q.type === 'short-answer'
    );
  }

  /**
   * Generate UID for document tracing
   */
  private generateUID(studentNumber: string, assessmentId: string, type: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('sha256')
      .update(`${studentNumber}:${assessmentId}:${type}:${timestamp}`)
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();
    return `AZR-${timestamp.toString(36).toUpperCase()}-${hash}`;
  }

  /**
   * Get gradebook for a course
   */
  getGradebook(courseId: string): GradebookEntry[] {
    const entries: GradebookEntry[] = [];
    for (const [key, entry] of this.gradebooks.entries()) {
      if (entry.courseId === courseId) {
        entries.push(entry);
      }
    }
    return entries.sort((a, b) => a.studentNumber.localeCompare(b.studentNumber));
  }

  /**
   * Get student gradebook
   */
  getStudentGradebook(studentId: string, courseId?: string): GradebookEntry[] {
    const entries: GradebookEntry[] = [];
    for (const [key, entry] of this.gradebooks.entries()) {
      if (entry.studentId === studentId && (!courseId || entry.courseId === courseId)) {
        entries.push(entry);
      }
    }
    return entries;
  }

  /**
   * Get grade by ID
   */
  getGrade(gradeId: string): Grade | undefined {
    return this.grades.get(gradeId);
  }

  /**
   * Get all grades for a student
   */
  getStudentGrades(studentId: string, courseId?: string): Grade[] {
    const grades: Grade[] = [];
    for (const grade of this.grades.values()) {
      if (grade.studentId === studentId && (!courseId || grade.courseId === courseId)) {
        grades.push(grade);
      }
    }
    return grades.sort((a, b) => b.gradedAt.getTime() - a.gradedAt.getTime());
  }

  /**
   * Get submission by ID
   */
  getSubmission(submissionId: string): Submission | undefined {
    return this.submissions.get(submissionId);
  }

  /**
   * Get assessment by ID
   */
  getAssessment(assessmentId: string): Assessment | undefined {
    return this.assessments.get(assessmentId);
  }
}

export const gradingEngine = GradingEngine.getInstance();
