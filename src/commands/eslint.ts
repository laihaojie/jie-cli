/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { runCmd } from '../utils/run'

export async function eslint() {
  const rootPath = process.cwd()
  const packageJsonPath = path.join(rootPath, 'package.json')

  // 判断当前是否有package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red('当前目录下没有package.json文件，请先执行npm init初始化'))
    return
  }

  // 判断是否安装了 '@djie/eslint-config'
  const packageName = '@djie/eslint-config'
  // eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
  const packageJson = require(packageJsonPath)
  const devDependencies = packageJson.devDependencies || {}
  const dependencies = packageJson.dependencies || {}

  if (!devDependencies[packageName] && !dependencies[packageName])
    console.log(chalk.green.bold(`开始安装 eslint ${packageName}`))

  let packageManager = ''

  // 获取packageJson 中的packageManager
  const currentPackageManager = packageJson.packageManager
  const packageManagerRe = /(npm|pnpm|yarn|bun)@\d+\.\d+\.\d+(-.+)?/
  if (currentPackageManager && packageManagerRe.test(currentPackageManager)) {
    packageManager = currentPackageManager.match(packageManagerRe)[1]
  }
  else {
    const { choose } = await inquirer.prompt([
      {
        type: 'rawlist',
        message: '请选择包管理器 ?',
        name: 'choose',
        choices: ['npm', 'yarn', 'pnpm', 'cnpm'],
      },
    ])

    packageManager = choose
  }
  let installCmd = ''

  // 安装 eslint 和 @djie/eslint-config
  if (packageManager === 'yarn')
    installCmd = `yarn add -D eslint@latest ${packageName}@latest`

  else if (packageManager === 'pnpm')
    installCmd = `pnpm add -D eslint@latest ${packageName}@latest`

  else if (packageManager === 'cnpm')
    installCmd = `cnpm add -D eslint@latest ${packageName}@latest`

  else
    installCmd = `npm install -D eslint@latest ${packageName}@latest`

  console.log(chalk.green.bold(`开始执行 ${installCmd}`))
  runCmd(installCmd)

  // 生成 eslint.config.js
  const eslintConfigPath = path.join(rootPath, 'eslint.config.js')

  // 判断当前目录下是否有eslint.config.js
  if (fs.existsSync(eslintConfigPath)) {
    // 确认是否覆盖
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        message: '当前目录下已存在eslint.config.js文件，是否重新生成 ?',
        name: 'confirm',
      },
    ])
    if (!confirm)
      return
  }

  let eslintConfig = ''
  if (packageJson.type === 'module') {
    eslintConfig = `
import jie from '@djie/eslint-config'
    
export default jie()
      `.trim()
  }
  else {
    eslintConfig = `
const jie = require('@djie/eslint-config').default

module.exports = jie()
      `.trim()
  }

  fs.writeFileSync(eslintConfigPath, eslintConfig)

  // 给package.json 添加 scripts
  packageJson.scripts = packageJson.scripts || {}
  if (!packageJson.scripts.lint)
    packageJson.scripts.lint = 'eslint .'
  if (!packageJson.scripts['lint:fix'])
    packageJson.scripts['lint:fix'] = 'eslint . --fix'

  // 写入package.json
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
}
