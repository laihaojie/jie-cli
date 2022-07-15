import { compressAccurately } from 'image-conversion'
import { ElMessage } from 'element-plus'
import { Policy } from '../typings/api'
import { Get } from './request'
import axios from '@/utils/request'

export function random_string(len?: number) {
  len = len || 32
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = chars.length
  let pwd = ''
  for (let i = 0; i < len; i++)
    pwd += chars.charAt(Math.floor(Math.random() * maxPos))

  return pwd
}

export function get_suffix(filename) {
  const pos = filename.lastIndexOf('.')
  let suffix = ''
  if (pos != -1)
    suffix = filename.substring(pos)

  return suffix
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
  return await axios.post('/api/public/upload', formData, config).catch((e) => {
    ElMessage.error(e || '文件上传失败')
    return new Promise(() => { })
  }) as string
}

export async function uploadImgFile(file: File) {
  if (file.size / 1024 / 1024 <= 1) return uploadFile(file)

  const res = await compressAccurately(file, 100)

  return uploadFile(new File([res], file.name))
}
