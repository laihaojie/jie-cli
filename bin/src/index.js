"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const frp_1 = __importDefault(require("./frp"));
const formatToUTF8_1 = __importDefault(require("./formatToUTF8"));
const checkVersion_1 = require("./utils/checkVersion");
const meta_1 = __importDefault(require("./utils/meta"));
async function default_1() {
    (0, checkVersion_1.checkVersion)();
    const choose = await inquirer_1.default.prompt([
        {
            type: 'rawlist',
            message: '请选择 ?',
            name: 'type',
            choices: [
                { name: '创建项目', value: 'create_project' },
                { name: '内网穿透', value: 'frp' },
                { name: '转换文件格式为UTF-8', value: 'utf8' },
            ],
        },
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
            },
        ]);
        (0, frp_1.default)(port);
    }
    if (choose.type === 'utf8') {
        const { file_type, ignore_dir } = await inquirer_1.default.prompt([
            { type: 'input', message: '输入转码的文件后缀名，多个用逗号隔开 (回车跳过):', name: 'file_type' },
            { type: 'input', message: '输入忽略的文件夹，多个用逗号隔开 (回车跳过):', name: 'ignore_dir' },
        ]);
        const file_type_arr = file_type.split(',');
        const ignore_dir_arr = ignore_dir.split(',');
        (0, formatToUTF8_1.default)(file_type_arr, ignore_dir_arr);
    }
}
exports.default = default_1;
