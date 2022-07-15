import { ElMessage } from 'element-plus'
import type { Rules, Values } from 'async-validator'
import Schema from 'async-validator'
import { unref } from 'vue'

export function parseData<T extends Record<string, any>>(data: T) {
  return Object.entries(data).reduce((pre, [key, item]) => (pre[key] = unref(item), pre), {})
}

export function validate<T extends Values>(data: T, rules: Rules): Promise<boolean> {
  const validator = new Schema(rules)
  return validator.validate(data)
    .then(() => false)
    .catch(e => (ElMessage.error(e.errors[0].message), true))
}
