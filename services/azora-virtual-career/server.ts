/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { virtualCareerPlatform } from './virtual-career-platform';

const app = express();
const PORT = process.env.VIRTUAL_CAREER_PORT || 4211;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Virtual Career Platform',
    timestamp: new Date(),
    statistics: virtualCareerPlatform.getStatistics(),
  });
});

app.post('/api/jobs/search', async (req, res) => {
  try {
    const results = await virtualCareerPlatform.searchJobs(req.body);
    res.json({ results, count: results.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resumes/build', async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const resume = await virtualCareerPlatform.buildResume(userId, data);
    res.json(resume);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/resumes/:userId', (req, res) => {
  const resume = virtualCareerPlatform.getUserResume(req.params.userId);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json(resume);
});

app.post('/api/skill-gaps/analyze', async (req, res) => {
  try {
    const { userId, targetJobId } = req.body;
    const gaps = await virtualCareerPlatform.analyzeSkillGaps(userId, targetJobId);
    res.json({ gaps, count: gaps.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/jobs/:jobId/apply', async (req, res) => {
  try {
    const { userId, resumeId } = req.body;
    const result = await virtualCareerPlatform.applyForJob(userId, req.params.jobId, resumeId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/applications/:userId', (req, res) => {
  const applications = virtualCareerPlatform.getUserApplications(req.params.userId);
  res.json({ applications, count: applications.length });
});

app.post('/api/career-fairs', (req, res) => {
  try {
    const fair = virtualCareerPlatform.createCareerFair(req.body);
    res.json(fair);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/career-fairs/:fairId/register', (req, res) => {
  try {
    const { userId } = req.body;
    virtualCareerPlatform.registerForCareerFair(userId, req.params.fairId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/career-fairs/:fairId/start', (req, res) => {
  try {
    virtualCareerPlatform.startCareerFair(req.params.fairId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n💼 Virtual Career Platform running on port ${PORT}\n`);
  console.log(`   🔍 Search Jobs: POST /api/jobs/search`);
  console.log(`   📝 Build Resume: POST /api/resumes/build`);
  console.log(`   🎯 Skill Gaps: POST /api/skill-gaps/analyze`);
  console.log(`   🎪 Career Fairs: POST /api/career-fairs`);
  console.log(`   ❤️ Health: http://localhost:${PORT}/health`);
  console.log(`\n   🌟 24/7 access, global jobs, AI-powered - Exceeds physical career centers!\n`);
});
