"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
exports.default = (port) => {
    const frpc_ini_template = `
[common]
server_addr = 47.101.45.132
server_port = 7000

[web]
type = http
local_port = $port
custom_domains = frp.laihaojie.com
`;
    const frpc_ini_path = path_1.default.join(__dirname, '../../frp_packages/frpc.ini');
    fs_1.default.writeFileSync(frpc_ini_path, frpc_ini_template.replace(/\$port/, port));
    var osValue = process.platform;
    console.log(chalk_1.default.blue(`打开 http://frp.laihaojie.com  预览`));
    if (osValue == 'darwin') {
        console.log("Mac OS");
    }
    else if (osValue == 'win32') {
        const frpc_win_path = path_1.default.join(__dirname, '../../frp_packages/win/frpc.exe');
        (0, child_process_1.execSync)(`${frpc_win_path} -c ${frpc_ini_path}`, { stdio: 'inherit' });
    }
    else if (osValue == 'android') {
        console.log("Android OS");
    }
    else if (osValue == 'linux') {
        console.log("Linux OS");
    }
    else {
        console.log("Other os");
    }
};
