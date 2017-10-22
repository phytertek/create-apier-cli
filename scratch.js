const inquirer = require('inquirer')
const currentDir = process.cwd()
const BASE = 'Base - file scaffolding only',
  CRUD = 'CRUD - file scaffolding and basic CRUD routes/controllers'

const initQuestions = [
  {
    name: 'type',
    type: 'list',
    message: 'What type of component do you want to build',
    choices: [BASE, CRUD]
  },
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
const schemaQuestion = [
  {
    name: 'existingSchema',
    type: 'confirm',
    message: 'Would you like to use an existing table?'
  }
]
const existingSchemaQuestion = [
  {
    name: 'existingSchemaName',
    type: 'list',
    message: 'Choose an existing table from the app',
    choices: () => {
      const schemaNames = getExisingSchema()
      return schemaNames.length > 0
        ? schemaNames
        : ['No tables found in the app, create a new one']
    }
  }
]
const newSchemaQuestion = [
  {
    name: 'newSchemaName',
    type: 'input',
    message: 'What would you like to call your table?',
    validate: input => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
      return 'Table name may only contain letters, numbers, underscores and dashes'
    }
  }
]
const getExisingSchema = () => {
  // returns array of schema names from project's app config and component dirs
  try {
    const appConfig = require(`${currentDir}/appConfig.js`)
    const names = Object.keys(
      appConfig.Components
    ).reduce((schemaNames, component) => {
      if (appConfig.Components[component].Schema) {
        const componentSchema = require(`${currentDir}/app/${component.toLowerCase()}/schema`)
        Object.keys(componentSchema).forEach(name => schemaNames.add(name))
      }
      return schemaNames
    }, new Set())
    return [...names]
  } catch (error) {
    console.error("You must be in an Apier project's root directory")
    throw new Error(error)
  }
}
const buildComponent = async () => {
  try {
    const { type, componentName } = await inquirer.prompt(initQuestions)
    switch (type) {
      case BASE:
        console.log(`Scaffold only ${componentName}`)
        return
      case CRUD:
        const { existingSchema } = await inquirer.prompt(schemaQuestion)
        if (existingSchema) {
          const { existingSchemaName } = await inquirer.prompt(
            existingSchemaQuestion
          )
          console.log(existingSchemaName)
        }
        return
      default:
        console.log(`Unrecognized answer - ${name}`)
        return
    }
  } catch (error) {
    console.log('Error ==>', error)
  }
}

buildComponent()
