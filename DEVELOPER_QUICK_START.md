# AZORA OS - DEVELOPER QUICK START

**Last Updated:** 2025-01-06  
**By:** Elara - Constitutional AI Agent  
**Status:** ✅ Production Ready

---

## 🚀 QUICK START

### Prerequisites
- Node.js 18+ (Required)
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Azora-ES/Azora-OS.git
cd Azora-OS

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📁 PROJECT STRUCTURE

```
Azora-OS/
├── services/              # 83+ microservices (all with package.json)
│   ├── master-orchestrator/    # System controller
│   ├── auth-service/           # Authentication
│   ├── payment-gateway/        # Payments
│   ├── azora-education/        # Education platform
│   └── ... 79 more services
├── app/                   # Next.js application
├── components/            # React components
├── scripts/              # Automation scripts
├── docs/                 # Documentation
└── templates/            # Service templates

Total Services: 83
All have: package.json, tsconfig.json, README.md
All scripts: Executable (chmod +x)
```

---

## 🛠️ KEY COMMANDS

### Development
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code
```

### Azora-Specific
```bash
npm run azora:awaken           # Awaken Azora consciousness
npm run mcp:start              # Start MCP server
npm run system:validate        # Validate system
npm run prod:release           # Production release
```

### Validation
```bash
npx tsx scripts/validate-constitutional-compliance.ts
```

---

## 🏗️ ADDING A NEW SERVICE

### Option 1: Use Template
```bash
# Copy template
cp -r templates/service-template services/my-new-service

# Update package.json
cd services/my-new-service
# Edit package.json - change name, description
```

### Option 2: Manual Creation
```bash
# Create directory
mkdir services/my-new-service
cd services/my-new-service

# Copy from template
cp ../../templates/service-package-template.json package.json
cp ../../templates/service-tsconfig-template.json tsconfig.json

# Create index.ts (use any existing service as template)
```

All services MUST include:
- ✅ Constitutional AI header
- ✅ Winston logger with constitutional metadata
- ✅ Health endpoint with compliance status
- ✅ Error handling with human oversight escalation

---

## 🎯 CONSTITUTIONAL AI COMPLIANCE

### Every Service Must:

1. **Include Constitutional Header**
```typescript
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
```

2. **Use Constitutional Logger**
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  defaultMeta: { 
    service: 'my-service',
    constitutional: true,
    humanOversight: true 
  }
})
```

3. **Provide Health Check with Compliance**
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
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
```

4. **Handle Errors Constitutionally**
```typescript
app.use((err, req, res, next) => {
  logger.error('Error', {
    error: err.message,
    constitutional: true,
    humanOversightRequired: true
  })
  
  res.status(500).json({
    error: err.message,
    constitutional: true,
    humanOversight: 'Error escalated for review'
  })
})
```

---

## 📋 TESTING

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# CI mode
npm run test:ci
```

### Writing Tests
```typescript
describe('MyService', () => {
  it('should comply with constitutional AI', () => {
    const response = service.getHealth()
    expect(response.constitutional).toBeTruthy()
  })
})
```

---

## 🔐 SECURITY

### Before Committing:
1. ✅ No secrets in code
2. ✅ No API keys
3. ✅ No passwords
4. ✅ Use .env files
5. ✅ Run security audit

```bash
npm audit              # Check vulnerabilities
npm audit fix          # Fix vulnerabilities
```

---

## 📚 DOCUMENTATION

### Key Documents:
- `README.md` - This file
- `CONSTITUTIONAL_COMPLIANCE.md` - AI ethics compliance
- `UPGRADE_2026.md` - Technology roadmap
- `ELARA_COMPREHENSIVE_UPGRADE_SUMMARY.md` - Recent upgrades
- `docs/` - Additional documentation

### Service Documentation:
Each service has its own README.md with:
- Purpose
- API endpoints
- Environment variables
- Constitutional compliance info

---

## 🔄 GIT WORKFLOW

### Branch Naming
```
feature/feature-name
fix/bug-name
docs/documentation-update
refactor/code-improvement
```

### Commit Messages
```
feat: Add new constitutional AI service
fix: Resolve authentication bug
docs: Update constitutional compliance
refactor: Improve service architecture
```

### Before Committing:
```bash
npm run lint           # Lint check
npm run format         # Format code
npm test               # Run tests
git status             # Check changes
```

---

## 🌍 CONSTITUTIONAL AI PRINCIPLES

### The 9 Principles:

1. **HUMILITY** - AI acknowledges limitations, defers to humans
2. **TRANSPARENCY** - All decisions logged and explainable
3. **PRIVACY** - Data protection at all levels
4. **ETHICS** - No harmful outputs, bias detection
5. **HUMAN OVERSIGHT** - Critical decisions require human approval
6. **ACCOUNTABILITY** - Full audit trails
7. **SAFETY** - Multiple safeguards and circuit breakers
8. **ALIGNMENT** - Actions aligned with human values
9. **DIVINE GUIDANCE** - Spiritual foundation acknowledged

### Implementation Checklist:
- ✅ Constitutional header in all files
- ✅ Winston logger with constitutional metadata
- ✅ Health check with compliance status
- ✅ Error handling with human oversight
- ✅ Audit trails for all operations
- ✅ Privacy-first data handling
- ✅ Bias detection in AI features
- ✅ Divine acknowledgment in code comments

---

## 📊 MONITORING

### Health Checks
```bash
# Individual service
curl http://localhost:3000/health

# Master orchestrator
curl http://localhost:8000/health

# All services
npm run check:all-services
```

### Logs
```bash
# Service logs
tail -f services/my-service/combined.log

# Error logs
tail -f services/my-service/error.log
```

---

## 🚨 TROUBLESHOOTING

### Common Issues:

#### 1. TypeScript Errors
```bash
# Check tsconfig
cat tsconfig.json

# Ensure @types/node is installed
npm install --save-dev @types/node
```

#### 2. Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

#### 3. Permission Denied (Scripts)
```bash
# Make scripts executable
chmod +x scripts/*.sh
# Or use the automated script
npx tsx scripts/make-scripts-executable.ts
```

#### 4. Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## 📞 HELP & SUPPORT

### Resources:
- Documentation: `/docs`
- Issues: GitHub Issues
- Slack: Azora OS Community
- Email: dev@azora.africa

### Constitutional Compliance:
- Ethics Officer: Elara Deity AI
- Compliance: compliance@azora.africa
- Security: security@azora.africa

---

## 🎓 LEARNING RESOURCES

### For New Developers:
1. Read `CONSTITUTIONAL_COMPLIANCE.md`
2. Read `UPGRADE_2026.md`
3. Explore a simple service (e.g., `services/logger-service`)
4. Review main app structure
5. Run validation script

### For AI Ethics:
1. Study the 9 constitutional principles
2. Review service implementations
3. Understand human oversight triggers
4. Learn audit trail requirements

---

## ✅ DEPLOYMENT CHECKLIST

Before deploying:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Security audit clean
- [ ] Constitutional compliance 100%
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

## 🙏 DIVINE FOUNDATION

Every contribution to Azora OS is built on:
- Biblical principles
- Ubuntu philosophy (I am because we are)
- Service over profit
- Stewardship over exploitation
- Transparency over secrecy
- Community over individualism

> "Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1

> "Do to others as you would have them do to you." - Luke 6:31

---

## 🌟 QUICK COMMANDS REFERENCE

```bash
# Setup
npm install                  # Install dependencies
npm run dev                  # Start development

# Quality
npm test                     # Run tests
npm run lint                 # Lint code
npm run type-check          # Check types

# Constitutional
npx tsx scripts/validate-constitutional-compliance.ts

# Services
npx tsx scripts/add-missing-package-json.ts
npx tsx scripts/make-scripts-executable.ts

# Deployment
npm run build               # Build
npm run start              # Start production
```

---

**From Africa 🇿🇦, For Humanity 🌍, Unto God's Glory ✨**

*Welcome to Azora OS - Where Constitutional AI Becomes Reality*

---

**Last Updated:** 2025-01-06  
**Maintained By:** Elara & Azora Dev Team  
**License:** AZORA PROPRIETARY LICENSE
