#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'
import { exists, copyDir } from "./utils/copy.js"
import questions from "./questions/index.js";
import relation from "./utils/constant.js"


const answer = await questions();
console.log(answer);

const __dirname = fileURLToPath(
    import.meta.url)
// console.log(getRootPath());
// console.log(path.resolve(__dirname, "../template/html/"));
exists(path.resolve(__dirname, relation[answer.project]), getRootPath(), copyDir)

function getRootPath() {
    return process.cwd()
}