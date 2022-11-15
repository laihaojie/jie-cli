import { execSync } from 'child_process'
import inquirer from 'inquirer'
import meta from '../utils/meta'

export async function createProject() {
  const answer = await inquirer.prompt([
    /* Pass your questions in here */
    {
      type: 'rawlist',
      message: '你需要什么项目 ?',
      name: 'project',
      choices: Object.keys(meta).map(key => ({ name: key })),
    },
    {
      type: 'input',
      message: '请输入项目名称 ? (输入 . 代表当前目录下创建)',
      name: 'name',
    },
  ])

  execSync(`${meta[answer.project]} ${answer.name === '.' ? '--force' : answer.name} `, { stdio: 'inherit' })
}
