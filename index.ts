#!/usr/bin/env node

import process from 'node:process'
import chalk from 'chalk'
import main from './src/index'

const startTime = Date.now()

process.on('exit', () => {
  console.log(`耗时：${Date.now() - startTime} ${globalThis.__IS_RUNNING ? chalk.green('ms') : chalk.yellow('ms')}`)
})

main()
