const fs = require('fs')
const inquirer = require('inquirer')
const beautify = require('js-beautify')

const includedFilesQuestion = [{
  name: 'files',
  type: 'checkbox',
  message: 'What will this component include?',
  choices: ['Schema', 'Routes', 'Services']
}]

module.exports = async(toolDir, currentDir, componentName) => {
  const {
    files
  } = await inquirer.prompt(includedFilesQuestion)
  const templatePath = `${toolDir}/component-templates/scaffold`
  const newComponentDir = `${currentDir}/app/${componentName.charAt(0).toLowerCase()}${componentName.slice(1)}`
  fs.mkdirSync(newComponentDir)
  const scaffoldFiles = fs.readdirSync(templatePath)
  scaffoldFiles.forEach(file => {
    const filePath = `${toolDir}/component-templates/scaffold/${file}`
    const thisFile = `${file.charAt(0).toUpperCase()}${file.slice(1, file.indexOf('.'))}`
    const contents = fs.readFileSync(filePath, 'utf-8')
    const newFilePath = `${newComponentDir}/${file}`
    if (files.includes(thisFile) || (files.includes('Routes') && thisFile === 'Controllers')) {
      fs.writeFileSync(newFilePath, contents, 'utf-8')
    }
  })
  let appConfig = fs.readFileSync(`${currentDir}/appConfig.js`, 'utf-8')
  let config = `${componentName.charAt(0).toUpperCase()}${componentName.slice(1)}: {\n`
  files.forEach(file => config += `${file.charAt(0).toUpperCase()}${file.slice(1)}: 'Add comments here',\n`)
  config += `},`
  appConfig = appConfig.split('\n')
  appConfig.splice(appConfig.indexOf('  Components: {') + 1, 0, config)
  appConfig = beautify(appConfig.join('\n'), {
    indent_size: 2
  })
  fs.writeFileSync(`${currentDir}/appConfig.js`, appConfig, 'utf-8')
}