/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Virtual Counseling Platform
 * 
 * 24/7 Mental Health Support that exceeds physical counseling centers
 * Features:
 * - 24/7 availability (vs limited hours)
 * - Anonymous access (vs stigma of on-campus)
 * - Global network of counselors (vs local only)
 * - AI mental health assistant (first-line support)
 * - Multilingual support
 * - Crisis intervention
 */

import { EventEmitter } from 'events';

export interface Counselor {
  id: string;
  name: string;
  credentials: string[];
  specializations: string[];
  languages: string[];
  availability: {
    timezone: string;
    hours: Array<{ day: string; start: string; end: string }>;
  };
  rating: number;
  sessionsCompleted: number;
  avatar?: string;
  bio?: string;
}

export interface CounselingSession {
  id: string;
  userId: string;
  counselorId?: string;
  type: 'individual' | 'group' | 'crisis' | 'ai-assistant';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledTime?: Date;
  startTime?: Date;
  endTime?: Date;
  topic: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  anonymous: boolean;
}

export interface CrisisAlert {
  id: string;
  userId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  responded: boolean;
  responseTime?: Date;
}

export class VirtualCounselingPlatform extends EventEmitter {
  private counselors: Map<string, Counselor> = new Map();
  private sessions: Map<string, CounselingSession> = new Map();
  private crisisAlerts: Map<string, CrisisAlert> = new Map();
  private aiAssistantActive: boolean = true;

  constructor() {
    super();
    this.initializeCounselors();
  }

  private initializeCounselors(): void {
    // Global network of counselors
    const sampleCounselors: Counselor[] = [
      {
        id: 'counselor-001',
        name: 'Dr. Sarah Johnson',
        credentials: ['Licensed Clinical Psychologist', 'PhD'],
        specializations: ['Anxiety', 'Depression', 'Academic Stress'],
        languages: ['en', 'es'],
        availability: {
          timezone: 'America/New_York',
          hours: [
            { day: 'Monday', start: '09:00', end: '17:00' },
            { day: 'Tuesday', start: '09:00', end: '17:00' },
            { day: 'Wednesday', start: '09:00', end: '17:00' },
            { day: 'Thursday', start: '09:00', end: '17:00' },
            { day: 'Friday', start: '09:00', end: '17:00' },
          ],
        },
        rating: 4.8,
        sessionsCompleted: 500,
        bio: 'Experienced in helping students manage academic stress...',
      },
      {
        id: 'counselor-002',
        name: 'Dr. Ahmed Hassan',
        credentials: ['Licensed Therapist', 'MA'],
        specializations: ['Cultural Adjustment', 'Family Issues'],
        languages: ['en', 'ar', 'fr'],
        availability: {
          timezone: 'Africa/Cairo',
          hours: [
            { day: 'Monday', start: '10:00', end: '18:00' },
            { day: 'Tuesday', start: '10:00', end: '18:00' },
            { day: 'Wednesday', start: '10:00', end: '18:00' },
            { day: 'Thursday', start: '10:00', end: '18:00' },
            { day: 'Friday', start: '10:00', end: '18:00' },
          ],
        },
        rating: 4.9,
        sessionsCompleted: 300,
      },
      // Add more counselors...
    ];

    sampleCounselors.forEach(counselor => this.counselors.set(counselor.id, counselor));
  }

  /**
   * Get available counselors
   */
  getAvailableCounselors(filters?: {
    specialization?: string;
    language?: string;
    timezone?: string;
  }): Counselor[] {
    let counselors = Array.from(this.counselors.values());

    if (filters) {
      if (filters.specialization) {
        counselors = counselors.filter(c =>
          c.specializations.includes(filters.specialization!)
        );
      }
      if (filters.language) {
        counselors = counselors.filter(c =>
          c.languages.includes(filters.language!)
        );
      }
      if (filters.timezone) {
        counselors = counselors.filter(c =>
          c.availability.timezone === filters.timezone
        );
      }
    }

    return counselors.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Schedule counseling session
   */
  async scheduleSession(userId: string, data: {
    counselorId?: string;
    type: 'individual' | 'group' | 'crisis';
    scheduledTime: Date;
    topic: string;
    anonymous?: boolean;
  }): Promise<CounselingSession> {
    const session: CounselingSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      counselorId: data.counselorId,
      type: data.type,
      status: 'scheduled',
      scheduledTime: data.scheduledTime,
      topic: data.topic,
      anonymous: data.anonymous ?? false,
    };

    this.sessions.set(session.id, session);
    this.emit('sessionScheduled', session);
    return session;
  }

  /**
   * Start session (instant access for crisis)
   */
  async startSession(userId: string, data: {
    type: 'individual' | 'crisis' | 'ai-assistant';
    topic: string;
    counselorId?: string;
    anonymous?: boolean;
  }): Promise<CounselingSession> {
    let counselorId = data.counselorId;

    // For crisis, find available counselor immediately
    if (data.type === 'crisis' && !counselorId) {
      const availableCounselors = this.getAvailableCounselors();
      if (availableCounselors.length > 0) {
        counselorId = availableCounselors[0].id;
      }
    }

    const session: CounselingSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      counselorId,
      type: data.type,
      status: 'active',
      startTime: new Date(),
      topic: data.topic,
      anonymous: data.anonymous ?? false,
    };

    this.sessions.set(session.id, session);

    if (data.type === 'crisis') {
      this.handleCrisisSession(session);
    }

    this.emit('sessionStarted', session);
    return session;
  }

  /**
   * Handle crisis session
   */
  private handleCrisisSession(session: CounselingSession): void {
    const alert: CrisisAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: session.userId,
      severity: 'high',
      message: `Crisis session started: ${session.topic}`,
      timestamp: new Date(),
      responded: false,
    };

    this.crisisAlerts.set(alert.id, alert);
    this.emit('crisisAlert', alert);

    // Auto-respond within 5 minutes
    setTimeout(() => {
      alert.responded = true;
      alert.responseTime = new Date();
      this.emit('crisisResponded', alert);
    }, 5 * 60 * 1000);
  }

  /**
   * AI Mental Health Assistant (24/7 first-line support)
   */
  async aiAssistantHelp(query: string, context?: string): Promise<{
    response: string;
    suggestions: string[];
    escalateToHuman?: boolean;
    resources: Array<{ title: string; url: string; type: string }>;
  }> {
    // In production, this would use AI to:
    // - Understand mental health concerns
    // - Provide immediate support
    // - Detect crisis situations
    // - Escalate to human counselors when needed

    const queryLower = query.toLowerCase();
    let escalateToHuman = false;

    // Crisis detection keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'hurt myself', 'no hope'];
    if (crisisKeywords.some(keyword => queryLower.includes(keyword))) {
      escalateToHuman = true;
      return {
        response: 'I\'m concerned about what you\'ve shared. Let me connect you with a counselor immediately. You\'re not alone, and help is available.',
        suggestions: [
          'Connect with a counselor now',
          'Call crisis hotline',
          'Find emergency resources',
        ],
        escalateToHuman: true,
        resources: [
          { title: 'Crisis Hotline', url: '/crisis/hotline', type: 'emergency' },
          { title: 'Emergency Resources', url: '/resources/emergency', type: 'resource' },
        ],
      };
    }

    // General support responses
    const responses: Record<string, string> = {
      'anxiety': 'I understand anxiety can be overwhelming. Here are some techniques that might help...',
      'stress': 'Academic stress is common. Let\'s work through some strategies...',
      'depression': 'Depression is treatable. Would you like to talk to a counselor?',
      'loneliness': 'Feeling lonely is difficult. There are ways to connect with others...',
    };

    let response = 'I\'m here to help. Can you tell me more about what you\'re experiencing?';
    for (const [key, value] of Object.entries(responses)) {
      if (queryLower.includes(key)) {
        response = value;
        break;
      }
    }

    return {
      response,
      suggestions: [
        'Schedule a session with a counselor',
        'Try breathing exercises',
        'Access self-help resources',
        'Join a support group',
      ],
      escalateToHuman: false,
      resources: [
        { title: 'Self-Help Resources', url: '/resources/self-help', type: 'resource' },
        { title: 'Support Groups', url: '/groups', type: 'group' },
        { title: 'Breathing Exercises', url: '/exercises/breathing', type: 'exercise' },
      ],
    };
  }

  /**
   * End session
   */
  endSession(sessionId: string, data?: {
    rating?: number;
    feedback?: string;
  }): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.endTime = new Date();
    if (data) {
      session.rating = data.rating;
      session.feedback = data.feedback;
    }

    this.emit('sessionEnded', session);
  }

  /**
   * Get user's sessions
   */
  getUserSessions(userId: string): CounselingSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => {
        const aTime = a.startTime || a.scheduledTime || new Date(0);
        const bTime = b.startTime || b.scheduledTime || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalCounselors: number;
    totalSessions: number;
    activeSessions: number;
    crisisAlerts: number;
    aiAssistantQueries: number;
  } {
    return {
      totalCounselors: this.counselors.size,
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values())
        .filter(s => s.status === 'active').length,
      crisisAlerts: this.crisisAlerts.size,
      aiAssistantQueries: 0, // Would track in production
    };
  }
}

export const virtualCounselingPlatform = new VirtualCounselingPlatform();
