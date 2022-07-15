import meta from '../utils/meta.js'

export default () => {
  return {
    type: 'rawlist',
    message: 'What project do you need ?',
    name: 'project',
    choices: Object.keys(meta).map(key => ({ name: key })),
  }
}

