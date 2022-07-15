#!/usr/bin/env node

import { execSync } from 'child_process'
import questions from './questions/index.js'
import meta from './utils/meta.js'

const answer = await questions()
console.log(answer)

execSync(meta[answer.project], { stdio: 'inherit' })
