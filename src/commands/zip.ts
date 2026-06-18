import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import archiver from 'archiver'
import chalk from 'chalk'
import { minimatch } from 'minimatch'

interface ZipOptions {
  inputPath?: string
  outputPath?: string
  excludeDirs?: string[]
  excludeFiles?: string[]
  isAll?: boolean // 是否显示所有文件
}

/**
 * 压缩指定文件夹为 ZIP 文件，支持过滤文件夹和文件，并显示进度
 * @param {object} [options] - 配置选项
 * @param {string} [options.inputPath] - 输入文件夹路径，默认为当前文件夹
 * @param {string} [options.outputPath] - 输出 ZIP 文件路径，默认为输入文件夹名称+.zip
 * @param {string[]} [options.excludeDirs] - 要排除的文件夹模式（支持通配符）
 * @param {string[]} [options.excludeFiles] - 要排除的文件模式（支持通配符）
 * @returns {Promise<string>} - 压缩完成后返回完成消息
 */
export async function zipFolder(options: ZipOptions = {}) {
  const inputPath = options.inputPath || '.'
  const outputPath = options.outputPath
  const excludeDirs = options.excludeDirs || []
  const excludeFiles = options.excludeFiles || []
  const isAll = options.isAll || false

  // 默认排除的文件夹和文件
  let defaultExcludeDirs = ['node_modules', '.git', ...(Array.isArray(excludeDirs) ? excludeDirs : [])]
  let defaultExcludeFiles = ['.DS_Store', 'Thumbs.db', 'desktop.ini', '*.log', '*.tmp', ...(Array.isArray(excludeFiles) ? excludeFiles : [])]
  if (isAll) {
    // 如果 isAll 为 true，则不排除任何目录和文件
    defaultExcludeDirs = []
    defaultExcludeFiles = []
  }

  // 确保输入路径是文件夹
  const absoluteInputPath = path.resolve(inputPath)
  try {
    const stats = await fs.lstat(absoluteInputPath) // 使用 lstat 避免符号链接问题
    if (!stats.isDirectory()) {
      throw new Error('输入路径必须是一个文件夹')
    }
  }
  catch (error: any) {
    throw new Error(`无效的输入路径: ${error.message}`)
  }

  // 设置默认输出路径：输入文件夹名称.zip，放在当前工作目录
  const inputName = path.basename(absoluteInputPath)
  const defaultOutputPath = path.join(process.cwd(), `${inputName}.zip`)

  let finalOutputPath = defaultOutputPath
  if (outputPath) {
    const resolvedOutput = path.resolve(outputPath)
    try {
      const outputStats = await fs.lstat(resolvedOutput)
      if (outputStats.isDirectory()) {
        finalOutputPath = path.join(resolvedOutput, `${inputName}.zip`)
      }
      else {
        finalOutputPath = resolvedOutput
      }
    }
    catch {
      // 路径不存在，视为文件路径
      finalOutputPath = resolvedOutput
    }
  }

  // 确保输出路径以 .zip 结尾
  if (!finalOutputPath.toLowerCase().endsWith('.zip')) {
    finalOutputPath = `${finalOutputPath}.zip`
  }

  // 检查输出文件是否已存在
  try {
    await fs.access(finalOutputPath)
    console.warn(chalk.yellow(`警告: 输出文件 ${finalOutputPath} 已存在，将被覆盖`))
  }
  catch {
    // 文件不存在，无需警告
  }

  // 计算总文件数以显示进度
  let totalFiles = 0
  let processedFiles = 0

  // 先一次性收集所有待压缩文件路径，避免两次 I/O 遍历
  const filesToArchive: { fullPath: string, relativePath: string }[] = []

  async function collectFiles(dir, zipPath) {
    try {
      const dirName = path.basename(dir)
      if (defaultExcludeDirs.some(pattern => minimatch(dirName, pattern))) {
        return
      }

      const files = await fs.readdir(dir, { withFileTypes: true })
      for (const file of files) {
        const fullPath = path.join(dir, file.name)
        const relativePath = path.join(zipPath, file.name)
        const stats = await fs.lstat(fullPath).catch(() => null)
        if (!stats) continue

        if (stats.isDirectory() && !stats.isSymbolicLink()) {
          await collectFiles(fullPath, relativePath)
        }
        else if (stats.isFile()) {
          if (!defaultExcludeFiles.some(pattern => minimatch(file.name, pattern))) {
            filesToArchive.push({ fullPath, relativePath })
          }
        }
      }
    }
    catch (error: any) {
      console.error(chalk.red(`无法读取 ${dir}: ${error.message}`))
    }
  }

  await collectFiles(absoluteInputPath, '')
  totalFiles = filesToArchive.length
  console.log(chalk.gray(`预计压缩文件数: ${totalFiles}`))

  // 创建输出流
  const output = createWriteStream(finalOutputPath)
  const archive = archiver('zip', {
    zlib: { level: 9 }, // 最大压缩级别
  })

  // 处理输出流事件
  const promise = new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(chalk.green(`\n压缩完成: ${finalOutputPath} (共 ${processedFiles}/${totalFiles} 个文件)`))
      resolve(`压缩完成: ${finalOutputPath}`)
    })
    output.on('error', err => reject(err))
    archive.on('error', err => reject(err))
    archive.on('progress', (data) => {
      processedFiles = data.entries.processed
      const percentage = totalFiles > 0 ? ((processedFiles / totalFiles) * 100).toFixed(2) : 0
      process.stdout.write(`\r${chalk.cyan(`压缩中: ${processedFiles}/${totalFiles} 个文件 (${percentage}%)`)}`)
    })
    archive.pipe(output)
  })

  // 开始压缩
  try {
    console.log(chalk.blue(`开始压缩到 ${finalOutputPath}`))
    for (const { fullPath, relativePath } of filesToArchive) {
      try {
        archive.file(fullPath, { name: relativePath })
      }
      catch (error: any) {
        console.error(chalk.red(`无法添加文件 ${fullPath}: ${error.message}`))
      }
    }
    await archive.finalize()
    return await promise
  }
  catch (error: any) {
    throw new Error(`压缩失败: ${error.message}`)
  }
}
