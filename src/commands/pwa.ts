import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import chalk from 'chalk'
import sharp from 'sharp'
import ora from 'ora'

export function generatePwaIcon(icon_path: string) {
  const inputPath = path.join(process.cwd(), icon_path)
  const outputDir = path.resolve(inputPath, '..')
  // 判断icon_path是不是一个文件
  if (!fs.existsSync(inputPath)) {
    console.log(chalk.red('文件不存在'))
    process.exit(1)
  }
  // 判断是不是一个文件还是一个目录
  const stat = fs.statSync(inputPath)

  if (stat.isDirectory()) {
    console.log(chalk.red('请传入文件路径,而不是目录'))
    process.exit(1)
  }
  // 判断是不是一个图片
  const ext = inputPath.split('.').pop()
  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    console.log(chalk.red('请传入图片'))
    process.exit(1)
  }

  const sizeList = [192, 512]
  const spinner = ora()
  sizeList.forEach((size) => {
    const outputName = `icon-${size}x${size}.png`
    const outputPath = path.join(outputDir, outputName)
    const logName = path.relative(process.cwd(), outputPath)

    spinner.start(chalk(`生成 ${chalk.bold(logName)}`))
    sharp(inputPath)
      .resize(size, size)
      .toFile(outputPath, (err, _info) => {
        if (err) {
          console.error(err)
          spinner.fail(chalk.red(`生成 ${chalk.bold(logName)} 失败`))
        }
        spinner.succeed(chalk.green(`生成 ${chalk.bold(logName)}`))
      })
  })
}
