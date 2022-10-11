"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const jschardet_1 = __importDefault(require("jschardet"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
exports.default = (file_type_arr, ignore_dir_arr) => {
    const root_path = process.cwd();
    const file_type = ['html', 'js', 'css', 'json', 'md', 'txt', 'vue', 'ts', 'tsx', 'jsx', ...file_type_arr];
    const to_code = 'UTF-8';
    const ignore = ['node_modules', '.git', '.vscode', 'bin', 'dist', 'build', ...ignore_dir_arr];
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
                    console.log(result, filePath);
                    if (result.encoding !== to_code && result.encoding !== 'ascii') {
                        const newData = iconv_lite_1.default.decode(data, result.encoding);
                        fs_extra_1.default.writeFileSync(filePath, iconv_lite_1.default.encode(newData, to_code));
                    }
                }
            }
        });
    }
    console.log('开始转码...', root_path);
    console.log(__dirname);
};
