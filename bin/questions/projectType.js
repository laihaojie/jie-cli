import meta from '../utils/meta.js'

export default () => {
  return {
    type: 'rawlist',
    message: '你需要什么项目 ?',
    name: 'project',
    choices: Object.keys(meta).map(key => ({ name: key })),
  }
}

