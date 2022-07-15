export default () => {
  return {
    type: 'rawlist',
    message: 'What project do you need ?',
    name: 'project',
    choices: [{
      name: 'Vue3',
    },
    {
      name: 'Vue2',
    },
    {
      name: 'Koa',
    },
    {
      name: 'Html',
    },
    {
      name: 'React',
    },
    ],
  }
}

