import fs from 'fs'

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

// 简单实现一个promisify
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      [].push.call(args, (err, result) => {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          resolve(result)
        }
      })
      // eslint-disable-next-line prefer-spread
      fn.apply(null, args)
    })
  }
}

export function readDirRecur(file, callback) {
  return readdir(file).then((files) => {
    files = files.map((item) => {
      const fullPath = `${file}/${item}`

      return stat(fullPath).then((stats) => {
        if (stats.isDirectory()) {
          return readDirRecur(fullPath, callback)
        }
        else {
          /* not use ignore files */
          if (item[0] === '.') {
            // console.log(item + ' is a hide file.');
          }
          else {
            callback && callback(item)
          }
        }
      })
    })
    return Promise.all(files)
  })
}

