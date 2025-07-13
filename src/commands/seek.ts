import fs from 'node:fs/promises'
import path from 'node:path';
import chalk from 'chalk'
import Table from 'cli-table3'
import { minimatch } from 'minimatch'

interface FindLargeFilesOptions {
  startPath?: string;
  size?: number;
  unit?: 'kb' | 'mb' | 'gb';
  excludeDirs?: string[];
  excludeFiles?: string[];
  maxShow?: number;
  isAll?: boolean; // 是否显示所有文件
}

/**
 * 查找指定文件夹下大于指定大小的文件
 * @param {string} [startPath='.'] - 起始文件夹路径，默认为当前文件夹
 * @param {number} [size=10] - 文件大小阈值，默认为10
 * @param {string} [unit='mb'] - 单位（'kb', 'mb', 'gb'），默认为'mb'
 * @returns {Promise<Array<{path: string, size: number, unit: string}>>} - 大于指定大小的文件列表
 */
export async function findLargeFiles(options: FindLargeFilesOptions = {}) {
  let startPath = options.startPath || '.'
  let size = options.size || 10
  let unit = options.unit || 'mb'
  let excludeDirs = options.excludeDirs || []
  let excludeFiles = options.excludeFiles || []
  let maxShow = options.maxShow || 10
  let isAll = options.isAll || false

  let defaultExcludeDirs = ['node_modules', '.git']
  if (excludeDirs && Array.isArray(excludeDirs) && excludeDirs.length > 0) {
    // 如果传入了排除目录，则将其添加到默认排除列表中
    defaultExcludeDirs.push(...excludeDirs);
  }
  let defaultExcludeFiles = ['.DS_Store', 'Thumbs.db', 'desktop.ini']
  if (excludeFiles && Array.isArray(excludeFiles) && excludeFiles.length > 0) {
    // 如果传入了排除文件，则将其添加到默认排除列表中
    defaultExcludeFiles.push(...excludeFiles);
  }
  if (isAll) {
    // 如果 isAll 为 true，则不排除任何目录和文件
    defaultExcludeDirs = [];
    defaultExcludeFiles = [];
  }
  // 定义单位转换因子
  const unitFactors = {
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  // 验证单位
  const normalizedUnit = unit.toLowerCase();
  if (!unitFactors[normalizedUnit]) {
    throw new Error('Invalid unit. Use "kb", "mb", or "gb"');
  }

  // 计算字节大小阈值
  const sizeThreshold = size * unitFactors[normalizedUnit];
  const largeFiles = [];

  /**
   * 递归遍历目录
   * @param {string} dir - 当前目录路径
   */
  async function traverseDirectory(dir) {
    try {
      // 检查是否需要排除当前文件夹
      const dirName = path.basename(dir);
      if (defaultExcludeDirs.some(pattern => minimatch(dirName, pattern))) {
        return;
      }

      const files = await fs.readdir(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          // 递归处理子文件夹
          await traverseDirectory(fullPath);
        } else if (file.isFile()) {
          // 检查是否需要排除当前文件
          if (defaultExcludeFiles.some(pattern => minimatch(file.name, pattern))) {
            continue;
          }
          try {
            // 获取文件信息
            const stats = await fs.stat(fullPath);
            if (stats.size > sizeThreshold) {
              largeFiles.push({
                path: fullPath,
                size: stats.size / unitFactors[normalizedUnit],
                unit: normalizedUnit
              });
            }
          } catch (error: any) {
            console.error(chalk.red(`Error reading file ${fullPath}:`), chalk.red(error.message));
          }
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`Error reading directory ${dir}:`), chalk.red(error.message));
    }
  }

  // 确保起始路径存在
  try {
    const absolutePath = path.resolve(startPath);
    const stats = await fs.stat(absolutePath);
    if (!stats.isDirectory()) {
      throw new Error('Start path must be a directory');
    }
    await traverseDirectory(absolutePath);
  } catch (error: any) {
    throw new Error(`Invalid start path: ${error.message}`);
  }
  // 按文件大小降序排序
  largeFiles.sort((a, b) => b.size - a.size);
  if (largeFiles.length === 0) {
    console.log(chalk.yellow(`没有找到大于 ${size} ${unit} 的文件`));
    return;
  }
  console.log(chalk.green(`查找完成，共找到 ${largeFiles.length} 个大于 ${size} ${unit} 的文件`));
  console.log(chalk.green(`最多展示前${maxShow}个大文件：`));
  // 创建表格
  const head = ['文件路径', `大小(${unit})`];
  const table = new Table({ head, colWidths: [null, 20] });
  // 添加数据到表格
  largeFiles.slice(0, maxShow).forEach(file => {
    table.push([file.path, `${file.size.toFixed(2)} ${file.unit}`]);
  });
  // 打印表格
  console.log(table.toString());
}