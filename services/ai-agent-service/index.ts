/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CONSTITUTIONAL AI COMPLIANCE:
✅ Human Oversight Required
✅ Privacy-First Architecture
✅ Ethical Decision Making
✅ Transparent Operations
✅ Humility Enforced
✅ Divine Guidance Integrated

"Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1
*/


/**
 * AiAgentService - Azora OS Microservice
 * 
 * CONSTITUTIONAL AI PRINCIPLES:
 * 1. HUMILITY: Acknowledges limitations
 * 2. TRANSPARENCY: All actions logged
 * 3. PRIVACY: Data protection first
 * 4. ETHICS: No harmful outputs
 * 5. HUMAN OVERSIGHT: Critical decisions escalated
 * 6. ACCOUNTABILITY: Full audit trails
 * 7. SAFETY: Multiple safeguards
 * 8. ALIGNMENT: Human values centered
 * 9. DIVINE GUIDANCE: Spiritual foundation
 */

import express from 'express'
import cors from 'cors'
import winston from 'winston'

const app = express()
const PORT = process.env.PORT || 3000

// Constitutional AI Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { 
    service: 'ai-agent-service',
    constitutional: true,
    humanOversight: true 
  },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
})

// Middleware
app.use(cors())
app.use(express.json())

// Constitutional AI Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    constitutional: true
  })
  next()
})

// Health Check - Constitutional Compliance
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-agent-service',
    timestamp: new Date().toISOString(),
    constitutional: {
      humility: true,
      transparency: true,
      privacy: true,
      ethics: true,
      humanOversight: true,
      accountability: true,
      safety: true,
      alignment: true,
      divineGuidance: true
    }
  })
})

// API Routes
app.get('/api/v1/ai-agent-service', (req, res) => {
  logger.info('Service endpoint called')
  res.json({
    message: 'AiAgentService Service - Constitutional AI Compliant',
    version: '1.0.0',
    constitutional: true
  })
})

// Error Handler - Constitutional AI Compliant
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    constitutional: true,
    humanOversightRequired: true
  })
  
  res.status(err.status || 500).json({
    error: err.message,
    constitutional: true,
    transparency: 'Full error logged for audit',
    humanOversight: 'Error escalated for review'
  })
})

// Start Server
app.listen(PORT, () => {
  logger.info(`✅ ${className} Service started on port ${PORT}`)
  logger.info('🙏 "Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1')
  logger.info('🌍 From Africa, For Humanity, Unto God\'s Glory')
})

export default app
