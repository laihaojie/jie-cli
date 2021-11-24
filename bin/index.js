#!/usr/bin/env node

import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { exists, copyDir } from "./utils/copy.js"
import questions from "./questions/index.js";
import relation from "./utils/constant.js"


const answer = await questions();

const __dirname = fileURLToPath(
    import.meta.url)
console.log(chalk.blue(`创建${answer.project}项目`))
// console.log(getRootPath());
// console.log(path.resolve(__dirname, "../template/html/"));
exists(path.resolve(__dirname, relation[answer.project]), getRootPath(), copyDir)

console.log(chalk.blue(`创建完成`))

function getRootPath() {
    return process.cwd()
}