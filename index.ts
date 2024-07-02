#!/usr/bin/env node

import process from 'node:process'
import chalk from 'chalk'
import main from './src/index'

const startTime = Date.now()

process.on('exit', () => {
  console.log(`Done in ${((Date.now() - startTime) / 1000).toFixed(1)}${globalThis.__IS_RUNNING ? 's' : ''}`)
})

main()
