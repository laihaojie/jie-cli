"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVersion = void 0;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const package_json_1 = require("../../package.json");
function checkVersion() {
    const latest_version = (0, child_process_1.execSync)('npm view @djie/cli version', { stdio: 'pipe' }).toString().trim();
    if (latest_version !== package_json_1.version)
        console.log(`有新版本更新啦! 输入: ${chalk_1.default.yellow('npm i -g @djie/cli')} 更新到最新版`);
}
exports.checkVersion = checkVersion;
