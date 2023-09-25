import { execSync } from 'node:child_process'
import path from 'node:path'
import inquirer from 'inquirer'
import createMeta from './meta'

export async function createProject() {
  const answer = await inquirer.prompt([
    /* Pass your questions in here */
    {
      type: 'rawlist',
      message: '你需要什么项目 ?',
      name: 'project',
      choices: Object.keys(createMeta).map(key => ({ name: key })),
    },
    {
      type: 'input',
      message: '请输入项目名称 ? (输入 . 代表当前目录下创建)',
      name: 'name',
    },
  ])

  const key = answer.project as keyof typeof createMeta
  const name = answer.name

  const effectOptions = {}
  if (createMeta[key].prompt) {
    const customAnswer = await inquirer.prompt(createMeta[key].prompt)

    Object.assign(effectOptions, customAnswer, { workDir: name === '.' ? process.cwd() : path.resolve(process.cwd(), name) })
  }

  execSync(`npx degit ${createMeta[key].templateUrl} ${name === '.' ? '--force' : name}`, { stdio: 'inherit' })

  const effect = createMeta[key].effect

  if (effect)
    effect(effectOptions)
}
