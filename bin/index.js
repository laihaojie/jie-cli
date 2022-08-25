#!/usr/bin/env node

import { execSync } from 'child_process'
import inquirer from 'inquirer'
import questions from './questions/index.js'
import meta from './utils/meta.js'
import chooses from './questions/chooses.js'
import frp from './frp/index.js'

const choose = await chooses()
if (choose.type === 'create_project') {

  const answer = await questions()

  execSync(`${meta[answer.project]} ${answer.name === '.' ? '--force' : answer.name} `, { stdio: 'inherit' })
}

if (choose.type === 'frp') {
  console.log('开启内网穿透')
  const { port } = await inquirer.prompt([
    {
      type: 'input',
      message: '请输入本地端口号:',
      name: 'port',
    }
  ])
  frp(port)
  // console.log(port)
}

