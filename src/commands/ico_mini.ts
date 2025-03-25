import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { isUrl, isValidFileName, randomStr } from '@djie/utils'
import chalk from 'chalk'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import ico from 'sharp-ico'

type ImgMeta = Partial<{
  width: number
  height: number
  format: string
  address: string
  size: number
}>
interface ImageToIcoOptions {
  size: number
  name?: string
  output?: string
  zip?: boolean
  info?: boolean
  meta?: ImgMeta
  type: 'ico' | 'png'
  __isUrl?: boolean
}

export async function imgToIcoMini(image_path: string, options: ImageToIcoOptions) {
  options.__isUrl = isUrl(image_path)
  options.meta = {}
  if (isUrl(image_path)) {
    // image_path = 'https://g.lingman.tech/app/lmapp/dev/uploadfiles/20230514/H6jJyPJ4Di5sBQRzm4zj8MWeiTtT6cMj.png'
    // image_path = 'https://img0.baidu.com/it/u=652041139,3023980007&fm=253&fmt=auto&app=138&f=JPG?w=460&h=649'

    const buffer = await (await fetch(image_path)).arrayBuffer()
    const fileTypeInfo = await fileTypeFromBuffer(Buffer.from(buffer))
    if (!fileTypeInfo) {
      console.log(chalk.red('无法获取文件类型'))
      process.exit(1)
    }

    options.meta.address = image_path
    if (fileTypeInfo.ext === 'ico') {
      options.type = 'png'
    }
    else {
      options.type = 'ico'
    }

    const urlObj = new URL(image_path)
    let imgName
    if (isValidFileName(path.basename(urlObj.pathname))) {
      imgName = `${path.basename(urlObj.pathname, path.extname(urlObj.pathname))}.${options.type}`
    }
    else {
      imgName = `${randomStr(10)}.${options.type}`
    }

    const inputPath = path.join(process.cwd(), imgName)
    await handleIco(Buffer.from(buffer), inputPath, options)
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

    const buffer = fs.readFileSync(inputPath)
    options.meta.address = inputPath
    if (ext === 'ico') {
      options.type = 'png'
    }
    else {
      options.type = 'ico'
    }

    await handleIco(buffer, inputPath, options)
  }
}

async function handleIco(buffer, inputPath, options: ImageToIcoOptions) {
  // 处理output
  const outputDir = options.output ? path.resolve(process.cwd(), options.output) : path.dirname(inputPath)
  const outputName = `${options.name ? options.name : path.basename(inputPath, path.extname(inputPath))}.${options.type}`
  const outputPath = path.join(outputDir, outputName)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  if (options.type === 'ico') {
    const sharpInstance = sharp(buffer)
    const pngBuffer = await sharpInstance.toFormat('png').toBuffer()

    await ico.sharpsToIco([sharp(pngBuffer)], outputPath, { sizes: [options.size], resizeOptions: {} })
  }
  else {
    ico.sharpsFromIco(buffer, {}, true).forEach((icon) => {
      icon.image.toFile(outputPath)
    })
  }
}
