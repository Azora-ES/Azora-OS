/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Database Models & Schemas
 * 
 * MongoDB/Mongoose schemas for all education services
 */

import mongoose from 'mongoose';

// ========== ASSESSMENT SCHEMAS ==========

const AssessmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true, index: true },
  moduleId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['quiz', 'assignment', 'exam', 'project', 'peer-review', 'self-assessment'], required: true },
  totalPoints: { type: Number, required: true },
  passingScore: { type: Number, required: true },
  dueDate: Date,
  timeLimit: Number,
  questions: [{
    id: String,
    type: String,
    text: String,
    points: Number,
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    rubric: mongoose.Schema.Types.Mixed,
    feedback: String,
  }],
  rubric: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
  constitutionalAlignment: Boolean,
});

const SubmissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assessmentId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    type: String,
    timestamp: Date,
  }],
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['submitted', 'graded', 'grading', 'returned'], default: 'submitted' },
  timeSpent: Number,
  ipAddress: String,
  deviceInfo: String,
});

const GradeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  submissionId: { type: String, required: true, index: true },
  assessmentId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  moduleId: String,
  totalPoints: Number,
  earnedPoints: Number,
  percentage: Number,
  letterGrade: String,
  gradedAt: { type: Date, default: Date.now },
  gradedBy: String,
  questionGrades: [{
    questionId: String,
    points: Number,
    maxPoints: Number,
    feedback: String,
    autoGraded: Boolean,
  }],
  feedback: String,
  rubricScores: mongoose.Schema.Types.Mixed,
  constitutionalAlignment: Number,
  uid: { type: String, required: true, unique: true, index: true },
});

// ========== CONTENT SCHEMAS ==========

const CourseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  code: { type: String, required: true, index: true },
  instructorId: { type: String, required: true, index: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  category: String,
  credits: Number,
  duration: Number,
  modules: [{
    id: String,
    courseId: String,
    title: String,
    description: String,
    order: Number,
    type: String,
    content: mongoose.Schema.Types.Mixed,
    resources: [mongoose.Schema.Types.Mixed],
    estimatedDuration: Number,
    prerequisites: [String],
  }],
  learningObjectives: [String],
  prerequisites: [String],
  status: { type: String, enum: ['draft', 'review', 'published', 'archived'], default: 'draft' },
  constitutionalScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: Number,
  publishedAt: Date,
});

const ResourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'link', 'code', 'dataset', 'video', 'image'] },
  url: { type: String, required: true },
  description: String,
  size: Number,
  constitutionallyVetted: Boolean,
  vettedAt: Date,
  vettedBy: String,
});

// ========== ANALYTICS SCHEMAS ==========

const ProgressDataSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  moduleId: String,
  completed: Boolean,
  completionDate: Date,
  timeSpent: Number,
  lastAccessed: { type: Date, default: Date.now },
  progress: Number,
  assessmentScores: [Number],
});

// ========== CREDENTIAL SCHEMAS ==========

const CredentialDocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  credentialId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  type: String,
  documentType: String,
  pdfUrl: String,
  watermark: {
    enabled: Boolean,
    text: String,
    logo: String,
    opacity: Number,
  },
  uid: { type: String, required: true, unique: true, index: true },
  metadata: {
    issuedDate: Date,
    issuer: String,
    blockchainHash: String,
    ledgerRecordId: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const LedgerRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  studentNumber: { type: String, required: true, index: true },
  credentialId: { type: String, required: true, index: true },
  credentialType: String,
  uid: { type: String, required: true, unique: true, index: true },
  blockchainHash: { type: String, required: true, index: true },
  issuedDate: Date,
  issuer: String,
  metadata: mongoose.Schema.Types.Mixed,
  verified: Boolean,
});

// ========== COLLABORATION SCHEMAS ==========

const ForumSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true, index: true },
  title: String,
  description: String,
  topics: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
});

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  content: String,
  read: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const StudyGroupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  courseId: { type: String, required: true, index: true },
  members: [{
    userId: String,
    role: String,
    joinedAt: Date,
  }],
  maxMembers: Number,
  visibility: { type: String, enum: ['public', 'private'] },
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
});

// ========== PAYMENT SCHEMAS ==========

const PaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  amount: Number,
  currency: String,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'] },
  paymentMethod: String,
  transactionId: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

const ScholarshipSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  eligibilityCriteria: [String],
  amount: Number,
  coverage: { type: String, enum: ['full', 'partial'] },
  percentage: Number,
  maxRecipients: Number,
  currentRecipients: { type: Number, default: 0 },
  applicationDeadline: Date,
  status: { type: String, enum: ['active', 'closed', 'expired'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

// ========== MEDIA SCHEMAS ==========

const VideoAssetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  description: String,
  url: String,
  thumbnailUrl: String,
  duration: Number,
  size: Number,
  format: String,
  quality: String,
  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'] },
  courseId: { type: String, index: true },
  moduleId: String,
  uploadedBy: String,
  uploadedAt: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed,
});

const VideoViewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  videoId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  watchedDuration: Number,
  completed: Boolean,
  deviceInfo: String,
  location: String,
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
});

// Export models
export const Assessment = mongoose.model('Assessment', AssessmentSchema);
export const Submission = mongoose.model('Submission', SubmissionSchema);
export const Grade = mongoose.model('Grade', GradeSchema);
export const Course = mongoose.model('Course', CourseSchema);
export const Resource = mongoose.model('Resource', ResourceSchema);
export const ProgressData = mongoose.model('ProgressData', ProgressDataSchema);
export const CredentialDocument = mongoose.model('CredentialDocument', CredentialDocumentSchema);
export const LedgerRecord = mongoose.model('LedgerRecord', LedgerRecordSchema);
export const Forum = mongoose.model('Forum', ForumSchema);
export const Message = mongoose.model('Message', MessageSchema);
export const StudyGroup = mongoose.model('StudyGroup', StudyGroupSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
export const Scholarship = mongoose.model('Scholarship', ScholarshipSchema);
export const VideoAsset = mongoose.model('VideoAsset', VideoAssetSchema);
export const VideoView = mongoose.model('VideoView', VideoViewSchema);

// Database connection
export async function connectDatabase(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}
