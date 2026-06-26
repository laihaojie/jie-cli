import process from 'node:process'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { clearAuthPassword, getAuthPassword, setAuthPassword } from '../utils/authConfig'

// jie passwd          交互式设置网页终端鉴权密码
// jie passwd --clear  清除密码（恢复无鉴权）
export async function passwd(options: { clear?: boolean }): Promise<void> {
  if (options.clear) {
    clearAuthPassword()
    console.log(chalk.green('✓ 已清除鉴权密码，网页终端恢复无鉴权'))
    return
  }

  const current = getAuthPassword()
  if (current)
    console.log(chalk.yellow('⚠️ 当前已配置密码，本次将覆盖'))

  const { password } = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: '请输入鉴权密码:',
      mask: '*',
      validate: (v: string) => (v.length === 0 ? '密码不能为空' : true),
    },
  ])
  const { confirm } = await inquirer.prompt([
    {
      type: 'password',
      name: 'confirm',
      message: '再次输入以确认:',
      mask: '*',
      validate: (v: string) => (v.length === 0 ? '请再次输入' : true),
    },
  ])

  if (password !== confirm) {
    console.error(chalk.red('✘ 两次输入不一致，未修改'))
    process.exit(1)
  }

  setAuthPassword(password)
  console.log(chalk.green('✓ 鉴权密码已设置，下次启动 bridge 后访问网页需输入该密码'))
}
