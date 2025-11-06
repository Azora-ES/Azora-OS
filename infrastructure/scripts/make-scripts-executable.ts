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

async function main() {
  console.log('🔧 Making all shell scripts executable...\n')
  console.log('='.repeat(60))

  try {
    // Find all .sh files
    const findCommand = 'find . -name "*.sh" -type f ! -executable'
    const files = execSync(findCommand, { encoding: 'utf-8' })
      .split('\n')
      .filter((f) => f.trim() !== '')

    console.log(`📝 Found ${files.length} non-executable shell scripts\n`)

    let fixed = 0
    for (const file of files) {
      try {
        execSync(`chmod +x "${file}"`)
        console.log(`✅ Made executable: ${file}`)
        fixed++
      } catch (error) {
        console.error(`❌ Failed to make executable: ${file}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n📊 Summary:`)
    console.log(`✅ Scripts made executable: ${fixed}`)
    console.log(`\n🙏 "Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1`)
    console.log(`🌍 From Africa, For Humanity, Unto God's Glory ✨\n`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main().catch(console.error)
