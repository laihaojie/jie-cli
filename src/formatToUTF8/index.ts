// 读取文件
import path from 'path'
import fs from 'fs-extra'
import jschardet from 'jschardet'
import iconv from 'iconv-lite'

export default (file_type_arr, ignore_dir_arr) => {
  const root_path = process.cwd()
  // 需要转码的文件格式
  const file_type = ['html', 'js', 'css', 'json', 'md', 'txt', 'vue', 'ts', 'tsx', 'jsx', ...file_type_arr]
  // 文件的目标编码
  const to_code = 'UTF-8'
  // 忽略的文件夹
  const ignore = ['node_modules', '.git', '.vscode', 'bin', 'dist', 'build', ...ignore_dir_arr]

  // 读取文件夹
  function readDir(rootPath) {
    const files = fs.readdirSync(rootPath)
    files.forEach((file) => {
      const filePath = path.join(rootPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        // 忽略文件夹
        if (ignore.includes(file))
          return

        readDir(filePath)
      }
      else {
        const ext = path.extname(filePath).slice(1)
        if (file_type.includes(ext)) {
          const data = fs.readFileSync(filePath, { encoding: 'binary' })
          const result = jschardet.detect(data)
          console.log(result, filePath)
          if (result.encoding !== to_code && result.encoding !== 'ascii') {
            // @ts-expect-error xxxx
            const newData = iconv.decode(data, result.encoding)
            fs.writeFileSync(filePath, iconv.encode(newData, to_code))
          }
        }
      }
    })
  }

  console.log('开始转码...', root_path)
  readDir(root_path)
}

