import { execSync } from 'child_process'
import inquirer from 'inquirer'
import frp from './frp'
import formatToUTF8 from './formatToUTF8'
import { checkVersion } from './utils/checkVersion'
import meta from './utils/meta'

export default async function () {
  checkVersion()

  const choose = await inquirer.prompt([
    {
      type: 'rawlist',
      message: '请选择 ?',
      name: 'type',
      choices: [
        { name: '创建项目', value: 'create_project' },
        { name: '内网穿透', value: 'frp' },
        { name: '转换文件格式为UTF-8', value: 'utf8' },
      ],
    },
  ])
  if (choose.type === 'create_project') {
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

  if (choose.type === 'frp') {
    // 开启内网穿透
    const { port } = await inquirer.prompt([
      {
        type: 'input',
        message: '请输入本地端口号:',
        name: 'port',
      },
    ])
    frp(port)
  }

  if (choose.type === 'utf8') {
    const { file_type, ignore_dir } = await inquirer.prompt([
      { type: 'input', message: '输入转码的文件后缀名，多个用逗号隔开 (回车跳过):', name: 'file_type' },
      { type: 'input', message: '输入忽略的文件夹，多个用逗号隔开 (回车跳过):', name: 'ignore_dir' },
    ])
    const file_type_arr = file_type.split(',')
    const ignore_dir_arr = ignore_dir.split(',')
    formatToUTF8(file_type_arr, ignore_dir_arr)
  }
}

