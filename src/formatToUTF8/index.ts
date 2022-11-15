// 读取文件
import path from 'path'
import fs from 'fs-extra'
import jschardet from 'jschardet'
import iconv from 'iconv-lite'
import chalk from 'chalk'
import inquirer from 'inquirer'

export async function formatToUTF8() {
  const { file_type, ignore_dir } = await inquirer.prompt([
    { type: 'input', message: '输入转码的文件后缀名，多个用逗号隔开 (回车跳过):', name: 'file_type' },
    { type: 'input', message: '输入忽略的文件夹，多个用逗号隔开 (回车跳过):', name: 'ignore_dir' },
  ])
  const file_type_arr = file_type.split(',')
  const ignore_dir_arr = ignore_dir.split(',')
  const root_path = process.cwd()
  // 需要转码的文件格式
  // 去重
  const transform_file_type = Array.from(new Set(['html', 'js', 'css', 'json', 'md', 'txt', 'vue', 'ts', 'tsx', 'jsx', ...file_type_arr]))
  // 文件的目标编码
  const to_code = 'UTF-8'
  // 忽略的文件夹
  const ignore = Array.from(new Set(['node_modules', '.git', '.vscode', 'dist', 'build', ...ignore_dir_arr]))
  // 计数
  let count = 0
  // 读取文件夹
  function readDir(rootPath) {
    const files = fs.readdirSync(rootPath)
    files.forEach((file) => {
      const filePath = path.join(rootPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        // 忽略文件夹
        if (ignore.includes(file))
          return

        readDir(filePath)
      }
      else {
        const ext = path.extname(filePath).slice(1)
        if (transform_file_type.includes(ext)) {
          const data = fs.readFileSync(filePath, { encoding: 'binary' })
          const result = jschardet.detect(data)
          if (result.encoding !== 'ascii') {
            console.log(result, filePath)
            count++
            const newData = iconv.decode(data as unknown as Buffer, result.encoding)
            fs.writeFileSync(filePath, iconv.encode(newData, to_code))
          }
        }
      }
    })
  }

  console.log(chalk.green('开始转码...', root_path))
  readDir(root_path)
  console.log(chalk.green(`转码完成，共转码${count}个文件`))
  console.log(chalk.yellow('转换的文件格式:', transform_file_type.join(' ')))
  console.log(chalk.yellow('忽略的文件夹:', ignore.join(' ')))
}

