/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { virtualCounselingPlatform } from './virtual-counseling-platform';

const app = express();
const PORT = process.env.VIRTUAL_COUNSELING_PORT || 4212;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Virtual Counseling Platform',
    timestamp: new Date(),
    statistics: virtualCounselingPlatform.getStatistics(),
  });
});

app.get('/api/counselors', (req, res) => {
  const counselors = virtualCounselingPlatform.getAvailableCounselors(req.query as any);
  res.json({ counselors, count: counselors.length });
});

app.post('/api/sessions/schedule', async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const session = await virtualCounselingPlatform.scheduleSession(userId, data);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/sessions/start', async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const session = await virtualCounselingPlatform.startSession(userId, data);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/sessions/:sessionId/end', (req, res) => {
  try {
    virtualCounselingPlatform.endSession(req.params.sessionId, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sessions/:userId', (req, res) => {
  const sessions = virtualCounselingPlatform.getUserSessions(req.params.userId);
  res.json({ sessions, count: sessions.length });
});

app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { query, context } = req.body;
    const result = await virtualCounselingPlatform.aiAssistantHelp(query, context);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n💚 Virtual Counseling Platform running on port ${PORT}\n`);
  console.log(`   🤖 AI Assistant: POST /api/ai/assistant`);
  console.log(`   📅 Schedule: POST /api/sessions/schedule`);
  console.log(`   🚨 Start Session: POST /api/sessions/start`);
  console.log(`   👥 Counselors: GET /api/counselors`);
  console.log(`   ❤️ Health: http://localhost:${PORT}/health`);
  console.log(`\n   🌟 24/7 support, anonymous, global - Exceeds physical counseling centers!\n`);
});
