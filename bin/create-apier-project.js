#! /usr/bin/env node
const inquirer = require('inquirer')
const generator = require('generate-password')
const shell = require('shelljs')
const fs = require('fs')
const Spinner = require('cli-spinner').Spinner
const spawn = require('child_process').spawn

const questions = [
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: input => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
      return 'Project name may only contain letters, numbers, underscores and dashes'
    }
  },
  {
    name: 'project-port',
    type: 'input',
    message: 'Project port:',
    default: 3000,
    validate: input => {
      if (/\b\d{4}|\d{5}\b/.test(input) && input <= 65535) return true
      return 'Port must be a 4 or 5 digit number less than 65535'
    }
  },
  {
    name: 'project-dburi',
    type: 'input',
    message: 'Development database:',
    default: 'mongodb://localhost/apier-dev',
    validate: input => {
      if (/(mongodb\:\/\/)/.test(input)) return true
      return 'Must be a valid mongo URI'
    }
  },
  {
    name: 'project-secret',
    type: 'input',
    message: 'Security secret',
    default: generator.generate({ length: 32, numbers: true, symbols: true })
  }
]

const currentDir = process.cwd()

const createProjectFiles = (path, name, port, db, secret) => {
  const projectFiles = fs.readdirSync(path)
  projectFiles.forEach(file => {
    const filePath = `${path}/${file}`
    const stats = fs.statSync(filePath)
    if (stats.isFile()) {
      let contents = fs.readFileSync(filePath, 'utf-8')
      if (file === 'appConfig.js') {
        contents = setAppConfig(contents, name, port, db, secret)
      }
      if (file === 'package.json') {
        contents = setPackageConfig(contents, name)
      }
      if (file === '.npmignore') file = '.gitignore'
      const writePath = `${currentDir}/${name}/${file}`
      fs.writeFileSync(writePath, contents, 'utf-8')
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${currentDir}/${name}/${file}`)
      createProjectFiles(`${path}/${file}`, `${name}/${file}`)
    }
  })
}

const setAppConfig = (contents, name, port, db, secret) => {
  contents = contents.replace('{{project-name}}', name)
  contents = contents.replace('{{project-port}}', port)
  contents = contents.replace('{{project-dburi}}', db)
  contents = contents.replace('{{project-secret}}', secret)
  return contents
}

const setPackageConfig = (contents, name) => {
  contents = contents.replace('{{project-name}}', name)
  return contents
}

console.log(`
***********************************************
*** Welcome to the Apier project generator! ***
***********************************************
***  Please answer the questions below to   ***
***  get started.                           ***
***********************************************
`)

inquirer
  .prompt(questions)
  .then(answers => {
    const {
      'project-name': projectName,
      'project-port': projectPort,
      'project-dburi': projectDb,
      'project-secret': projectSecret
    } = answers
    const templatePath = `${__dirname}/project-template`

    fs.mkdirSync(`${currentDir}/${projectName}`)
    createProjectFiles(
      templatePath,
      projectName,
      projectPort,
      projectDb,
      projectSecret
    )
    const commands = [`cd ${projectName}`, 'npm install']
    const commandCall = spawn(commands.join(' && '), { shell: true })
    const spinner = new Spinner(`%s Building ${projectName}...`)
    spinner.setSpinnerString(17)
    spinner.start()
    commandCall.on('exit', () => {
      spinner.stop(true)
      console.log(`
      Build complete!

      Don't forget to start your mongo server before
      running ${projectName}! 
      
      To start your ${projectName} development server, 
      cd into ${projectName} and run: 
      
      npm run start:dev
      
      Enjoy!`)
    })
  })
  .catch(error => console.log(error))
