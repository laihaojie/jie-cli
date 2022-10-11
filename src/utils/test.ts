/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')
const jschardet = require('jschardet')
const txt = fs.readFileSync(path.join(process.cwd(), 'test.js'), { encoding: 'binary' })

const result = jschardet.detect(txt)

console.log(result)

const data = iconv.decode(txt, result.encoding)
console.log(data)
// 删除之前的文件
fs.unlinkSync(path.join(process.cwd(), 'test.js'))
// 重新写入文件
fs.writeFileSync(path.join(process.cwd(), 'test.js'), iconv.encode(data, 'utf8'))
