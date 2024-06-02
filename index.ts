#!/usr/bin/env node

import process from 'node:process'
import main from './src/index'

const startTime = Date.now()

process.on('exit', () => {
  console.log(`耗时：${Date.now() - startTime}ms`)
})

main()
