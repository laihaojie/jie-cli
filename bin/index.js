#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const frp_1 = __importDefault(require("./frp"));
const meta_1 = __importDefault(require("./utils/meta"));
(async function () {
    const choose = await inquirer_1.default.prompt([
        {
            type: 'rawlist',
            message: '请选择 ?',
            name: 'type',
            choices: [{
                    name: "创建项目",
                    value: "create_project"
                }, {
                    name: "内网穿透",
                    value: "frp"
                }],
        }
    ]);
    if (choose.type === 'create_project') {
        const answer = await inquirer_1.default.prompt([
            {
                type: 'rawlist',
                message: '你需要什么项目 ?',
                name: 'project',
                choices: Object.keys(meta_1.default).map(key => ({ name: key })),
            },
            {
                type: 'input',
                message: '请输入项目名称 ? (输入 . 代表当前目录下创建)',
                name: 'name',
            },
        ]);
        (0, child_process_1.execSync)(`${meta_1.default[answer.project]} ${answer.name === '.' ? '--force' : answer.name} `, { stdio: 'inherit' });
    }
    if (choose.type === 'frp') {
        const { port } = await inquirer_1.default.prompt([
            {
                type: 'input',
                message: '请输入本地端口号:',
                name: 'port',
            }
        ]);
        (0, frp_1.default)(port);
    }
})();
