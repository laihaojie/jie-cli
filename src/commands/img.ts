import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import type { Buffer } from 'node:buffer'
import chalk from 'chalk'
import sharp from 'sharp'
import ora from 'ora'
import { isUrl } from '@djie/utils'
import AmdZip from 'adm-zip'

interface ImageResizeOptions {
  width: number[]
  height: number[]
  name?: string
  output?: string
  zip?: boolean
}

export async function imgResize(image_path: string, options: ImageResizeOptions) {
  if (isUrl(image_path)) {
    console.log('这是一个URL')
  }
  else {
    const inputPath = path.join(process.cwd(), image_path)

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

    const widthList = options.width
    const heightList = options.height

    if (widthList.length === 0 && heightList.length === 0 && !options.name && !options.zip && !options.output) {
      console.log(chalk.green('没接收任何指令，跳过图片操作'))
      process.exit(0)
    }

    // 处理output
    const outputDir = options.output ? path.resolve(process.cwd(), options.output) : path.dirname(inputPath)

    // 处理zip
    const zipDir = options.zip ? outputDir : ''

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const generateList = [] as GenerateOptions[]

    if (widthList.length === 0 && heightList.length === 0) {
      if (!options.name && !options.zip && outputDir === path.dirname(inputPath)) {
        console.log(chalk.green('输出的路径和输入的路径一致，跳过图片操作'))
        process.exit(0)
      }
      const outputPath = path.join(outputDir, options.name ? `${options.name}.${ext}` : path.basename(inputPath))
      const buffer = fs.readFileSync(inputPath)
      generateList.push({ buffer, output: outputPath })
    }
    else {
      const sizeList = widthList.length > heightList.length ? widthList : heightList
      for (let i = 0; i < sizeList.length; i++) {
        const width = widthList[i] || null
        const height = heightList[i] || null
        const sharpInstance = sharp(inputPath)
        const buffer = await sharpInstance.resize(width, height).toBuffer()
        const outputName = `${options.name ? options.name : path.basename(inputPath, `.${ext}`)}-${width || height}x${height || width}.${ext}`
        const outputPath = path.join(outputDir, outputName)
        generateList.push({ buffer, output: outputPath })
      }
    }
    generateByOptions(generateList, zipDir)
  }
}

async function handleImg(buffer: Buffer, imgPath, options: ImageResizeOptions) {

}

interface GenerateOptions {
  buffer: Buffer
  output: string
}

function generateByOptions(list: GenerateOptions[], zipDir: string) {
  const spinner = ora()
  if (!zipDir) {
    list.forEach(({ buffer, output }) => {
      const relativeName = path.relative(process.cwd(), output)
      spinner.start(chalk(`生成 ${chalk.bold(relativeName)}`))
      fs.writeFileSync(output, buffer)
      spinner.succeed(chalk.green(`生成 ${chalk.bold(relativeName)}`))
    })
  }
  else {
    const zip = new AmdZip()
    const outputZipPath = path.join(zipDir, 'img-output.zip')
    list.forEach(({ buffer, output }) => {
      const fileName = path.basename(output)
      spinner.start(chalk(`添加${chalk.bold(fileName)}到zip`))
      zip.addFile(fileName, buffer)
      spinner.succeed(chalk.green(`${chalk.bold(fileName)}添加到zip成功`))
    })

    const relativeName = path.relative(process.cwd(), outputZipPath)
    spinner.start(chalk(`生成 ${chalk.bold(relativeName)}`))
    zip.writeZip(outputZipPath)
    spinner.succeed(chalk.green(`生成 ${chalk.bold(relativeName)}`))
  }
}

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
