
import type { Ref } from 'vue'

export default function (count: Ref) {

  const add = () => {
    count.value++
  }

  return {
    add
  }

}