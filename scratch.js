#! /usr/bin/env node

const inquirer = require('inquirer')
const getExistingStructure = require('./utilities/getExistingStructure')
const scaffoldComponent = require('./utilities/scaffoldComponent')
const currentDir = process.cwd()
const BASE = 'Base - file scaffolding only',
  CRUD = 'CRUD - file scaffolding and basic CRUD routes/controllers'
let existingStructure
const initQuestions = [
  // {
  //   name: 'type',
  //   type: 'list',
  //   message: 'What type of component do you want to build',
  //   choices: [BASE]
  // },
  {
    name: 'componentName',
    type: 'input',
    message: 'What would you like to call the component?',
    validate: input => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
      return 'Component name may only contain letters, numbers, underscores and dashes'
    }
  }
]
// const schemaQuestion = [{
//   name: 'existingSchema',
//   type: 'confirm',
//   message: 'Would you like to use an existing table?'
// }]
// const existingSchemaQuestion = [{
//   name: 'existingSchemaName',
//   type: 'list',
//   message: 'Choose an existing table from the app',
//   choices: () => {
//     const schemaNames = Object.keys(existingStructure.Schema)
//     return schemaNames.length > 0 ?
//       schemaNames : ['No tables found in the app, create a new one']
//   }
// }]
// const newSchemaQuestion = [{
//   name: 'newSchemaName',
//   type: 'input',
//   message: 'What would you like to call your table?',
//   validate: input => {
//     if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
//     return 'Table name may only contain letters, numbers, underscores and dashes'
//   }
// }]
const buildComponent = async() => {
  // existingStructure = getExistingStructure(currentDir)
  try {
    const {
      // type,
      componentName
    } = await inquirer.prompt(initQuestions)

    scaffoldComponent(__dirname, currentDir, componentName)
    // switch (type) {
    //   case BASE:
    //     scaffoldComponent(__dirname, currentDir, componentName)
    //     return
    //     case CRUD:
    //       const {
    //         existingSchema
    //       } = await inquirer.prompt(schemaQuestion)
    //       if (existingSchema) {
    //         const {
    //           existingSchemaName
    //         } = await inquirer.prompt(
    //           existingSchemaQuestion
    //         )
    //         console.log(existingSchemaName)
    //       }
    //       return
    //   default:
    //     console.log(`Unrecognized answer - ${name}`)
    //     return
    // }
  } catch (error) {
    console.log('Error ==>', error)
  }
}

buildComponent()