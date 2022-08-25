import inquirer from 'inquirer'

export default () => {
  return inquirer.prompt([
    {
      type: 'rawlist',
      message: '请选择 ?',
      name: 'type',
      choices: [{
        name: "创建项目",
        value: "create_project"
      }, {
        name: "内网穿透",
        value: "frp"
      }],
    }
  ])
}
