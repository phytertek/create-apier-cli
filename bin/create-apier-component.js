#! /usr/bin/env node

const inquirer = require('inquirer')
const scaffoldComponent = require('./utilities/scaffoldComponent')
const currentDir = process.cwd()
const BASE = 'Base - file scaffolding only'
const initQuestions = [{
  name: 'componentName',
  type: 'input',
  message: 'What would you like to call the component?',
  validate: input => {
    if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
    return 'Component name may only contain letters, numbers, underscores and dashes'
  }
}]
const buildComponent = async() => {
  try {
    const {
      componentName
    } = await inquirer.prompt(initQuestions)
    scaffoldComponent(__dirname, currentDir, componentName)
  } catch (error) {
    console.log('Error ==>', error)
  }
}

buildComponent()