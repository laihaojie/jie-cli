#!/usr/bin/env node

import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { exists, copyDir } from "./utils/copy.js"
import questions from "./questions/index.js";
import { readDirRecur } from './utils/readFIleCount.js'
import relation from "./utils/constant.js"


const answer = await questions();

const __dirname = fileURLToPath(
    import.meta.url)
console.log(chalk.blue(`开始创建${answer.project}项目`))


var fileList = []
await readDirRecur(path.resolve(__dirname, relation[answer.project]), function(filePath) {
    fileList.push(filePath)
})


exists(path.resolve(__dirname, relation[answer.project]), getRootPath(), copyDir, fileList.length)

function getRootPath() {
    return process.cwd()
}