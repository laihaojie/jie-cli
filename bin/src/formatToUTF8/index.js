"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const jschardet_1 = __importDefault(require("jschardet"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const chalk_1 = __importDefault(require("chalk"));
exports.default = (file_type_arr, ignore_dir_arr) => {
    const root_path = process.cwd();
    const file_type = Array.from(new Set(['html', 'js', 'css', 'json', 'md', 'txt', 'vue', 'ts', 'tsx', 'jsx', ...file_type_arr]));
    const to_code = 'UTF-8';
    const ignore = Array.from(new Set(['node_modules', '.git', '.vscode', 'dist', 'build', ...ignore_dir_arr]));
    let count = 0;
    function readDir(rootPath) {
        const files = fs_extra_1.default.readdirSync(rootPath);
        files.forEach((file) => {
            const filePath = path_1.default.join(rootPath, file);
            const stats = fs_extra_1.default.statSync(filePath);
            if (stats.isDirectory()) {
                if (ignore.includes(file))
                    return;
                readDir(filePath);
            }
            else {
                const ext = path_1.default.extname(filePath).slice(1);
                if (file_type.includes(ext)) {
                    const data = fs_extra_1.default.readFileSync(filePath, { encoding: 'binary' });
                    const result = jschardet_1.default.detect(data);
                    if (result.encoding !== 'ascii') {
                        console.log(result, filePath);
                        count++;
                        const newData = iconv_lite_1.default.decode(data, result.encoding);
                        fs_extra_1.default.writeFileSync(filePath, iconv_lite_1.default.encode(newData, to_code));
                    }
                }
            }
        });
    }
    console.log(chalk_1.default.green('开始转码...', root_path));
    readDir(root_path);
    console.log(chalk_1.default.green(`转码完成，共转码${count}个文件`));
    console.log(chalk_1.default.yellow('转换的文件格式:', file_type.join(' ')));
    console.log(chalk_1.default.yellow('忽略的文件夹:', ignore.join(' ')));
};
