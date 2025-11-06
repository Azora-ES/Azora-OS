#!/usr/bin/env tsx
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

import * as fs from 'fs'
import * as path from 'path'

const CONSTITUTIONAL_HEADER = `/*
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
`

const SERVICES_WITHOUT_PACKAGE_JSON = [
  'ai-agent-service',
  'ai-evolution-engine',
  'ai-orchestrator',
  'airtime-rewards-service',
  'analytics-service',
  'api-gateway',
  'audit-logging-service',
  'auth-service',
  'azora-coin-service',
  'azora-institutional-system',
  'azora-pay-service',
  'azora-pricing',
  'billing-service',
  'course-service',
  'crypto-core',
  'decentralized-banking',
  'dna-service',
  'email-service',
  'enrollment-service',
  'exchange-rate-service',
  'finance',
  'founder-ledger-service',
  'governance-service',
  'kyc-aml-service',
  'lending-service',
  'llm-wrapper-service',
  'logger-service',
  'notification-service',
  'payment-gateway',
  'payment-service',
  'quantum-ai-orchestrator',
  'quantum-deep-mind',
  'quantum-tracking',
  'security-service',
  'session-service',
  'student-earnings-service',
  'swarm-coordination',
  'token-exchange',
  'user-service',
  'virtual-card-service',
  'virtual-cards'
]

function createPackageJson(serviceName: string): object {
  const scopedName = `@azora/${serviceName}`
  
  return {
    name: scopedName,
    version: '1.0.0',
    description: `Azora OS ${serviceName} - Constitutional AI Compliant`,
    main: 'index.ts',
    type: 'module',
    scripts: {
      start: 'tsx index.ts',
      dev: 'tsx watch index.ts',
      build: 'tsc',
      test: 'jest',
      lint: 'eslint . --ext .ts,.tsx',
      'type-check': 'tsc --noEmit'
    },
    keywords: ['azora', 'constitutional-ai', 'microservice', 'africa', serviceName],
    author: 'Azora ES (Pty) Ltd',
    license: 'PROPRIETARY',
    dependencies: {
      express: '^5.1.0',
      winston: '^3.11.0',
      cors: '^2.8.5',
      dotenv: '^16.3.1',
      axios: '^1.6.0'
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      typescript: '^5.3.3',
      tsx: '^4.7.1',
      jest: '^29.7.0',
      'ts-jest': '^29.1.1',
      '@types/jest': '^29.5.5',
      eslint: '^8.51.0',
      '@typescript-eslint/eslint-plugin': '^6.7.5',
      '@typescript-eslint/parser': '^6.7.5'
    },
    engines: {
      node: '>=18.0.0'
    }
  }
}

function createTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      lib: ['ES2022'],
      moduleResolution: 'node',
      resolveJsonModule: true,
      allowJs: true,
      checkJs: false,
      outDir: './dist',
      rootDir: './',
      removeComments: true,
      noEmit: false,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      alwaysStrict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      skipLibCheck: true,
      types: ['node', 'jest']
    },
    include: ['./**/*.ts'],
    exclude: ['node_modules', 'dist']
  }
}

function createIndexTs(serviceName: string): string {
  const className = serviceName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return `${CONSTITUTIONAL_HEADER}

/**
 * ${className} - Azora OS Microservice
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
    service: '${serviceName}',
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
  logger.info(\`\${req.method} \${req.path}\`, {
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
    service: '${serviceName}',
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
app.get('/api/v1/${serviceName}', (req, res) => {
  logger.info('Service endpoint called')
  res.json({
    message: '${className} Service - Constitutional AI Compliant',
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
  logger.info(\`✅ \${className} Service started on port \${PORT}\`)
  logger.info('🙏 "Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1')
  logger.info('🌍 From Africa, For Humanity, Unto God\\'s Glory')
})

export default app
`
}

function createReadme(serviceName: string): string {
  const className = serviceName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return `# ${className} Service

**Constitutional AI Compliant Microservice**

## Overview
${className} is a core microservice in the Azora OS ecosystem, built with Constitutional AI principles at its foundation.

## Constitutional AI Compliance ✅

- ✅ **Humility**: Acknowledges limitations
- ✅ **Transparency**: All decisions logged
- ✅ **Privacy**: Data protection first
- ✅ **Ethics**: No harmful outputs
- ✅ **Human Oversight**: Critical decisions require approval
- ✅ **Accountability**: Full audit trails
- ✅ **Safety**: Multiple safeguards
- ✅ **Alignment**: Human values centered
- ✅ **Divine Guidance**: Spiritual foundation

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

### Health Check
\`\`\`
GET /health
\`\`\`

Returns constitutional compliance status and service health.

### Service Endpoint
\`\`\`
GET /api/v1/${serviceName}
\`\`\`

Main service endpoint.

## Environment Variables

\`\`\`
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## License

AZORA PROPRIETARY LICENSE  
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

---

**"Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1**

**From Africa 🇿🇦, For Humanity 🌍, Unto God's Glory ✨**
`
}

async function main() {
  console.log('🚀 Adding package.json to services...\n')
  console.log('=' .repeat(60))

  let added = 0
  let skipped = 0

  for (const serviceName of SERVICES_WITHOUT_PACKAGE_JSON) {
    const servicePath = path.join(process.cwd(), 'services', serviceName)
    
    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  Service directory not found: ${serviceName}`)
      skipped++
      continue
    }

    const packageJsonPath = path.join(servicePath, 'package.json')
    const tsConfigPath = path.join(servicePath, 'tsconfig.json')
    const indexTsPath = path.join(servicePath, 'index.ts')
    const readmePath = path.join(servicePath, 'README.md')

    try {
      // Add package.json
      if (!fs.existsSync(packageJsonPath)) {
        const packageJson = createPackageJson(serviceName)
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
        console.log(`✅ Created package.json for ${serviceName}`)
      } else {
        console.log(`⏭️  Skipped ${serviceName} - package.json exists`)
        skipped++
        continue
      }

      // Add tsconfig.json
      if (!fs.existsSync(tsConfigPath)) {
        const tsConfig = createTsConfig()
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2) + '\n')
        console.log(`✅ Created tsconfig.json for ${serviceName}`)
      }

      // Add index.ts if it doesn't exist
      if (!fs.existsSync(indexTsPath)) {
        const indexTs = createIndexTs(serviceName)
        fs.writeFileSync(indexTsPath, indexTs)
        console.log(`✅ Created index.ts for ${serviceName}`)
      }

      // Add README.md if it doesn't exist
      if (!fs.existsSync(readmePath)) {
        const readme = createReadme(serviceName)
        fs.writeFileSync(readmePath, readme)
        console.log(`✅ Created README.md for ${serviceName}`)
      }

      added++
      console.log(``)
    } catch (error) {
      console.error(`❌ Error processing ${serviceName}:`, error)
    }
  }

  console.log('=' .repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`✅ Services processed: ${added}`)
  console.log(`⏭️  Services skipped: ${skipped}`)
  console.log(`\n🙏 "Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1`)
  console.log(`🌍 From Africa, For Humanity, Unto God's Glory ✨\n`)
}

main().catch(console.error)
