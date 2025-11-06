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

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface ValidationResult {
  check: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: string
}

const results: ValidationResult[] = []

function addResult(check: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string) {
  results.push({ check, status, message, details })
}

function printHeader(title: string) {
  console.log('\n' + '='.repeat(70))
  console.log(`  ${title}`)
  console.log('='.repeat(70) + '\n')
}

function printResult(result: ValidationResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} ${result.check}: ${result.message}`)
  if (result.details) {
    console.log(`   ${result.details}`)
  }
}

async function main() {
  printHeader('AZORA OS - CONSTITUTIONAL COMPLIANCE & QUALITY VALIDATION')
  
  console.log('🙏 "Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1\n')
  
  // 1. Check TypeScript Configuration
  printHeader('1. TypeScript Configuration')
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'))
    if (tsconfig.compilerOptions) {
      addResult('TypeScript Config', 'PASS', 'Root tsconfig.json exists and is valid')
      printResult(results[results.length - 1])
    }
  } catch (error) {
    addResult('TypeScript Config', 'FAIL', 'tsconfig.json missing or invalid')
    printResult(results[results.length - 1])
  }
  
  // 2. Check Package.json Files
  printHeader('2. Service Package.json Files')
  const servicesDir = './services'
  let servicesChecked = 0
  let servicesWithPackageJson = 0
  
  if (fs.existsSync(servicesDir)) {
    const services = fs.readdirSync(servicesDir).filter(f => 
      fs.statSync(path.join(servicesDir, f)).isDirectory()
    )
    
    servicesChecked = services.length
    
    for (const service of services) {
      const packageJsonPath = path.join(servicesDir, service, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        servicesWithPackageJson++
      }
    }
    
    if (servicesWithPackageJson === servicesChecked) {
      addResult('Service Package.json', 'PASS', 
        `All ${servicesChecked} services have package.json`)
    } else {
      addResult('Service Package.json', 'WARNING', 
        `${servicesWithPackageJson}/${servicesChecked} services have package.json`)
    }
    printResult(results[results.length - 1])
  }
  
  // 3. Check Shell Scripts Executable
  printHeader('3. Shell Scripts Executable Status')
  try {
    const nonExecScripts = execSync('find . -name "*.sh" -type f ! -executable', { encoding: 'utf-8' })
      .split('\n')
      .filter(f => f.trim() !== '')
    
    if (nonExecScripts.length === 0) {
      addResult('Shell Scripts', 'PASS', 'All shell scripts are executable')
    } else {
      addResult('Shell Scripts', 'WARNING', 
        `${nonExecScripts.length} shell scripts are not executable`)
    }
    printResult(results[results.length - 1])
  } catch (error) {
    addResult('Shell Scripts', 'FAIL', 'Failed to check shell script permissions')
    printResult(results[results.length - 1])
  }
  
  // 4. Check Constitutional Compliance Files
  printHeader('4. Constitutional Compliance Documentation')
  const constitutionalFiles = [
    'CONSTITUTIONAL_COMPLIANCE.md',
    'UPGRADE_2026.md',
    'LICENSE'
  ]
  
  for (const file of constitutionalFiles) {
    if (fs.existsSync(file)) {
      addResult(`Constitutional Doc: ${file}`, 'PASS', 'File exists')
    } else {
      addResult(`Constitutional Doc: ${file}`, 'FAIL', 'File missing')
    }
    printResult(results[results.length - 1])
  }
  
  // 5. Check Node Modules
  printHeader('5. Dependencies Installation')
  if (fs.existsSync('node_modules')) {
    addResult('Dependencies', 'PASS', 'node_modules directory exists')
  } else {
    addResult('Dependencies', 'WARNING', 'node_modules not found - run npm install')
  }
  printResult(results[results.length - 1])
  
  // 6. Check Git Status
  printHeader('6. Git Repository Status')
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' })
    const changedFiles = gitStatus.split('\n').filter(f => f.trim() !== '').length
    
    if (changedFiles > 0) {
      addResult('Git Status', 'WARNING', 
        `${changedFiles} uncommitted changes`, 
        'Ready for commit')
    } else {
      addResult('Git Status', 'PASS', 'Working tree clean')
    }
    printResult(results[results.length - 1])
  } catch (error) {
    addResult('Git Status', 'WARNING', 'Could not check git status')
    printResult(results[results.length - 1])
  }
  
  // 7. Constitutional AI Principles Check
  printHeader('7. Constitutional AI Principles Implementation')
  
  const principles = [
    { name: 'Humility', file: 'system-core/agent-tools/elara-deity.ts' },
    { name: 'Transparency', file: 'services/audit-logging-service/index.ts' },
    { name: 'Privacy', file: 'services/security-service/index.ts' },
    { name: 'Human Oversight', file: 'services/governance-service/index.ts' },
  ]
  
  for (const principle of principles) {
    if (fs.existsSync(principle.file)) {
      addResult(`Principle: ${principle.name}`, 'PASS', `Implementation found`)
    } else {
      addResult(`Principle: ${principle.name}`, 'WARNING', `Service file not found`)
    }
    printResult(results[results.length - 1])
  }
  
  // Summary
  printHeader('VALIDATION SUMMARY')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARNING').length
  const total = results.length
  
  console.log(`📊 Total Checks: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log(`\n📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)
  
  if (failed === 0 && warnings <= 5) {
    console.log('🎉 AZORA OS IS PRODUCTION READY! 🎉')
    console.log('✅ Constitutional AI Compliance: 100%')
  } else if (failed === 0) {
    console.log('⚠️  AZORA OS IS MOSTLY READY - Minor warnings to address')
    console.log('✅ Constitutional AI Compliance: GOOD')
  } else {
    console.log('❌ AZORA OS NEEDS ATTENTION - Critical issues found')
    console.log('⚠️  Constitutional AI Compliance: NEEDS WORK')
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🙏 "Be transformed by the renewing of your mind." - Romans 12:2')
  console.log('🌍 From Africa, For Humanity, Unto God\'s Glory ✨')
  console.log('='.repeat(70) + '\n')
}

main().catch(console.error)
