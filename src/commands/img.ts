import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import chalk from 'chalk'
import type { FitEnum, FormatEnum } from 'sharp'
import sharp from 'sharp'
import ora from 'ora'
import { isUrl, isValidFileName, randomStr } from '@djie/utils'
import AmdZip from 'adm-zip'
import { fromBuffer } from 'file-type'

interface ImageResizeOptions {
  width: number[]
  height: number[]
  name?: string
  rotate?: number
  output?: string
  type?: string
  fit?: keyof FitEnum | undefined
  ext?: string
  zip?: boolean
  __isUrl?: boolean
}

export async function imgResize(image_path: string, options: ImageResizeOptions) {
  options.ext = options.type
  options.__isUrl = isUrl(image_path)
  const extNames = getSharpFormat()

  if (isUrl(image_path)) {
    // image_path = 'https://g.lingman.tech/app/lmapp/dev/uploadfiles/20230514/H6jJyPJ4Di5sBQRzm4zj8MWeiTtT6cMj.png'
    // image_path = 'https://img0.baidu.com/it/u=652041139,3023980007&fm=253&fmt=auto&app=138&f=JPG?w=460&h=649'

    const buffer = await (await fetch(image_path)).arrayBuffer()
    const fileTypeInfo = await fromBuffer(Buffer.from(buffer))
    if (!fileTypeInfo) {
      console.log(chalk.red('无法获取文件类型'))
      process.exit(1)
    }

    if (!extNames.includes(fileTypeInfo.ext)) {
      console.log(chalk.red('不支持的文件类型'))
      process.exit(1)
    }

    options.ext = options.ext || fileTypeInfo.ext

    const urlObj = new URL(image_path)
    let imgName
    if (isValidFileName(path.basename(urlObj.pathname))) {
      imgName = `${path.basename(urlObj.pathname, path.extname(urlObj.pathname))}.${options.ext}`
    }
    else {
      imgName = `${randomStr(10)}.${options.ext}`
    }

    const inputPath = path.join(process.cwd(), imgName)
    await handleImg(Buffer.from(buffer), inputPath, options)
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

    const ext = path.extname(inputPath).slice(1)
    if (!extNames.includes(ext)) {
      console.log(chalk.red('不支持的文件类型'))
      process.exit(1)
    }

    const buffer = fs.readFileSync(inputPath)

    options.ext = options.ext || ext

    await handleImg(buffer, ext === options.ext ? inputPath : replaceFileSuffix(inputPath, options.ext), options)
  }
}

async function handleImg(buffer: Buffer, inputPath: string, options: ImageResizeOptions) {
  const widthList = options.width
  const heightList = options.height

  if (widthList.length === 0 && heightList.length === 0 && !options.name && !options.zip && !options.output && !options.type && !options.rotate && !options.__isUrl) {
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
    if (!options.zip && outputDir === path.dirname(inputPath) && (path.basename(inputPath, `.${options.ext}`) === options.name) && !options.rotate && !options.__isUrl) {
      console.log(chalk.green('输出的路径和输入的路径一致，跳过图片操作'))
      process.exit(0)
    }
    const outputPath = path.join(outputDir, options.name ? `${options.name}.${options.ext}` : path.basename(inputPath))
    const sharpInstance = sharp(buffer)
    if (options.rotate) {
      sharpInstance.rotate(options.rotate)
    }
    const outputBuffer = await sharpInstance.toFormat(options.ext as keyof FormatEnum).toBuffer()
    generateList.push({ buffer: outputBuffer, output: outputPath })
  }
  else {
    const sizeList = widthList.length > heightList.length ? widthList : heightList
    for (let i = 0; i < sizeList.length; i++) {
      const width = widthList[i] || null
      const height = heightList[i] || null
      const sharpInstance = sharp(buffer)
      if (options.rotate) {
        sharpInstance.rotate(options.rotate)
      }
      const outputBuffer = await sharpInstance.resize(width, height, { fit: options.fit }).toFormat(options.ext as keyof FormatEnum).toBuffer()
      const outputName = `${options.name ? options.name : path.basename(inputPath, `.${options.ext}`)}-${width || height}x${height || width}.${options.ext}`
      const outputPath = path.join(outputDir, outputName)
      generateList.push({ buffer: outputBuffer, output: outputPath })
    }
  }
  generateByOptions(generateList, zipDir)
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

function replaceFileSuffix(filePath, newSuffix) {
  // 解析文件路径
  const parsedPath = path.parse(filePath)

  // 修改后缀名
  parsedPath.ext = newSuffix.startsWith('.') ? newSuffix : `.${newSuffix}`
  parsedPath.base = parsedPath.name + parsedPath.ext // 更新 base 属性

  // 重建路径
  return path.format(parsedPath)
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

export function getSharpFormat() {
  return Array.from(new Set(Object.keys(sharp.format).map((key) => {
    return sharp.format[key]
  }).filter((i) => {
    return i.input.buffer && i.output.file
  }).map(i => [i.id, i.output.alias || []]).flat(Number.MAX_SAFE_INTEGER)))
}
