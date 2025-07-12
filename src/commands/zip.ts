import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { minimatch } from 'minimatch'
import chalk from 'chalk';

/**
 * 压缩指定文件夹为 ZIP 文件，支持过滤文件夹和文件，并显示进度
 * @param {string} [inputPath='.'] - 输入文件夹路径，默认为当前文件夹
 * @param {string} [outputPath] - 输出 ZIP 文件路径，默认为输入文件夹名称+.zip
 * @param {string[]} [excludeDirs=[]] - 要排除的文件夹模式（支持通配符）
 * @param {string[]} [excludeFiles=[]] - 要排除的文件模式（支持通配符）
 * @returns {Promise<string>} - 压缩完成后返回完成消息
 */
export async function zipFolder(inputPath = '.', outputPath, excludeDirs = [], excludeFiles = []) {
  // 默认排除的文件夹和文件
  const defaultExcludeDirs = ['node_modules', '.git', ...(Array.isArray(excludeDirs) ? excludeDirs : [])];
  const defaultExcludeFiles = ['.DS_Store', 'Thumbs.db', 'desktop.ini', '*.log', '*.tmp', ...(Array.isArray(excludeFiles) ? excludeFiles : [])];

  // 确保输入路径是文件夹
  const absoluteInputPath = path.resolve(inputPath);
  try {
    const stats = await fs.lstat(absoluteInputPath); // 使用 lstat 避免符号链接问题
    if (!stats.isDirectory()) {
      throw new Error('输入路径必须是一个文件夹');
    }
  } catch (error: any) {
    throw new Error(`无效的输入路径: ${error.message}`);
  }

  // 设置默认输出路径为输入文件夹名称+.zip
  const defaultOutputPath = path.join(absoluteInputPath, `${path.basename(absoluteInputPath)}.zip`);
  let finalOutputPath = outputPath ? path.join(path.resolve(outputPath), `${path.basename(absoluteInputPath)}.zip`) : defaultOutputPath;


  // 检查 outputPath 是否为目录，若是则追加默认文件名
  try {
    const outputStats = await fs.lstat(finalOutputPath).catch(() => null);
    if (outputStats && outputStats.isDirectory()) {
      finalOutputPath = path.join(finalOutputPath, `${path.basename(absoluteInputPath)}.zip`);
    }
  } catch (error) {
    // 文件不存在，忽略错误
  }

  // 确保输出路径以 .zip 结尾
  if (!finalOutputPath.toLowerCase().endsWith('.zip')) {
    finalOutputPath = `${finalOutputPath}.zip`;
  }

  // 检查输出文件是否已存在
  try {
    await fs.access(finalOutputPath);
    console.warn(chalk.yellow(`警告: 输出文件 ${finalOutputPath} 已存在，将被覆盖`));
  } catch (error) {
    // 文件不存在，无需警告
  }

  // 计算总文件数以显示进度
  let totalFiles = 0;
  let processedFiles = 0;
  const processedPaths = new Set(); // 防止重复计数

  /**
   * 计算总文件数（用于进度显示）
   * @param {string} dir - 当前目录路径
   */
  async function countFiles(dir) {
    try {
      const dirName = path.basename(dir);
      if (defaultExcludeDirs.some(pattern => minimatch(dirName, pattern))) {
        return;
      }

      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        const stats = await fs.lstat(fullPath).catch(() => null);
        if (!stats) continue; // 跳过无法访问的文件/目录

        if (stats.isDirectory() && !stats.isSymbolicLink()) {
          await countFiles(fullPath);
        } else if (stats.isFile()) {
          if (!defaultExcludeFiles.some(pattern => minimatch(file.name, pattern))) {
            totalFiles++;
          }
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`无法统计 ${dir} 中的文件: ${error.message}`));
    }
  }

  // 先计算总文件数
  await countFiles(absoluteInputPath);
  console.log(chalk.gray(`预计压缩文件数: ${totalFiles}`));

  // 创建输出流
  const output = createWriteStream(finalOutputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // 最大压缩级别
  });

  // 处理输出流事件
  const promise = new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(chalk.green(`\n压缩完成: ${finalOutputPath} (共 ${processedFiles}/${totalFiles} 个文件)`));
      resolve(`压缩完成: ${finalOutputPath}`);
    });
    output.on('error', (err) => reject(err));
    archive.on('error', (err) => reject(err));
    archive.on('entry', (entry) => {
      if (!processedPaths.has(entry.name)) {
        processedPaths.add(entry.name);
        processedFiles = processedPaths.size;
        const percentage = totalFiles > 0 ? ((processedFiles / totalFiles) * 100).toFixed(2) : 0;
        process.stdout.write(`\r${chalk.cyan(`压缩中: ${processedFiles}/${totalFiles} 个文件 (${percentage}%)`)}`);
      }
    });
    archive.on('finish', () => {
      output.end(); // 确保输出流关闭
    });
    archive.pipe(output);
  });

  /**
   * 递归添加文件夹内容到 ZIP
   * @param {string} dir - 当前目录路径
   * @param {string} zipPath - ZIP 文件中的相对路径
   */
  async function addToArchive(rootDir, rootZipPath) {
    const stack = [{ dir: rootDir, zipPath: rootZipPath }];

    while (stack.length > 0) {
      const { dir, zipPath } = stack.pop();
      const dirName = path.basename(dir);

      if (defaultExcludeDirs.some(pattern => minimatch(dirName, pattern))) {
        continue;
      }

      let files;
      try {
        files = await fs.readdir(dir, { withFileTypes: true });
      } catch (error: any) {
        console.error(chalk.red(`无法读取目录 ${dir}: ${error.message}`));
        continue;
      }

      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        const relativePath = path.join(zipPath, file.name);

        let stats;
        try {
          stats = await fs.lstat(fullPath);
        } catch {
          continue; // 无法访问就跳过
        }

        if (stats.isDirectory() && !stats.isSymbolicLink()) {
          stack.push({ dir: fullPath, zipPath: relativePath });
        } else if (stats.isFile()) {
          if (defaultExcludeFiles.some(pattern => minimatch(file.name, pattern))) {
            continue;
          }

          try {
            archive.file(fullPath, { name: relativePath });
          } catch (error: any) {
            console.error(chalk.red(`无法添加文件 ${fullPath}: ${error.message}`));
          }
        }
      }
    }
  }

  // 开始压缩
  try {
    console.log(chalk.blue(`开始压缩到 ${finalOutputPath}`));
    await addToArchive(absoluteInputPath, '');
    await archive.finalize();
    return await promise;
  } catch (error: any) {
    throw new Error(`压缩失败: ${error.message}`);
  }
}