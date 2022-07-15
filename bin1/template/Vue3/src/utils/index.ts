/**
 *
 * @param {String} key
 * @returns
 */
export function localGet(key: string) {
  try {
    return JSON.parse(window.localStorage.getItem(key) as string)
  }
  catch (error) {
    return window.localStorage.getItem(key)
  }
}

export function localSet(key: string, value: any) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function localRemove(key: string) {
  window.localStorage.removeItem(key)
}

export function isWechat(): boolean { return !!window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) }

export function isMobileDevice(): boolean { return !!window.navigator.userAgent.toLowerCase().match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i) }

export function isMobile(value: any): boolean { return !!value.toString().match(/^1[3|4|5|7|8][0-9]{9}/) }

export function isString(obj: any): boolean { return Object.prototype.toString.call(obj) === '[object String]' }

export function isNumber(obj: any): boolean { return Object.prototype.toString.call(obj) === '[object Number]' }

export function isObject(obj: any): boolean { return Object.prototype.toString.call(obj) === '[object Object]' }

export function isArray(value: any): boolean { return Array.isArray(value) }

export function isHtmlElement(node: any): boolean { return node && node.nodeType === Node.ELEMENT_NODE }

export const isFunction = (functionToCheck: any): boolean => {
  const getType = {}
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
}

export const isUndefined = (val: any): boolean => {
  // eslint-disable-next-line no-void
  return val === void 0
}

export const isDefined = (val: any): boolean => {
  return val !== undefined && val !== null
}

export const isEmpty = function (val: any): boolean {
  // null or undefined
  if (val == null) return true

  if (typeof val === 'boolean') return false

  if (typeof val === 'number') return !val

  if (val instanceof Error) return val.message === ''

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length
    }
  }
  return false
}

export function randomStr(length = 10): string {
  const seeder = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  let randomStr = ''
  for (let i = 0; i < length; i++)
    randomStr += seeder.charAt(Math.floor(Math.random() * seeder.length))

  return randomStr
}

export function rafThrottle(fn: Function) {
  let locked = false
  return function (this: any, ...args: any[]) {
    if (locked) return
    locked = true
    window.requestAnimationFrame(() => {
      fn.apply(this, args)
      locked = false
    })
  }
}

export function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url: string) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj: any = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str: string) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7F && code <= 0x7FF) s++
    else if (code > 0x7FF && code <= 0xFFFF) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual: Array<any>) {
  const newArray = [] as Array<any>
  for (let i = 0; i < actual.length; i++) {
    if (actual[i])
      newArray.push(actual[i])
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json: any) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return ''
      return `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`
    }),
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url: string) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search)
    return {}

  const obj: any = {}
  const searchArr = search.split('&')
  searchArr.forEach((v) => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val: string) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target: any, source: any) {
  if (typeof target !== 'object')
    target = {}

  if (Array.isArray(source))
    return source.slice()

  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object')
      target[property] = objectMerge(target[property], sourceProperty)
    else
      target[property] = sourceProperty
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element: HTMLElement, className: string) {
  if (!element || !className)
    return

  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += `${className}`
  }
  else {
    classString
      = classString.substr(0, nameIndex)
      + classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func: Function, wait: number, immediate: boolean) {
  let timeout: any, args: any, context: any, timestamp: any, result: any

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    }
    else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (this: any, ...args: any[]) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args as any[])
      context = args = null as any
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source: any) {
  if (!source && typeof source !== 'object')
    throw new Error('error arguments')

  const targetObj: any = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object')
      targetObj[keys] = deepClone(source[keys])
    else
      targetObj[keys] = source[keys]
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr: any) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = `${+new Date()}`
  const randomNum = `${(1 + Math.random()) * 65536}`
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele: HTMLElement, cls: string) {
  return !!ele.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele: HTMLElement, cls: string) {
  if (!hasClass(ele, cls)) ele.className += ` ${cls}`
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele: HTMLElement, cls: string) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp(`(\\s|^)${cls}(\\s|$)`)
    ele.className = ele.className.replace(reg, ' ')
  }
}

