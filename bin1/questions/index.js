import inquirer from 'inquirer'
import projectType from './projectType.js'

export default () => {
  return inquirer.prompt([
    /* Pass your questions in here */
    projectType(),

  ])
}
