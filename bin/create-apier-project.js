#! /usr/bin/env node
const fs = require('fs');
const inquirer = require('inquirer');
const generator = require('generate-password');
const Spinner = require('cli-spinner').Spinner;
const spawn = require('child_process').spawn;

const questions = [
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: input => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      return 'Project name may only contain letters, numbers, underscores and dashes';
    }
  },
  {
    name: 'project-port',
    type: 'input',
    message: 'Project port:',
    default: 3000,
    validate: input => {
      if (/\b\d{4}|\d{5}\b/.test(input) && input <= 65535) return true;
      return 'Port must be a 4 or 5 digit number less than 65535';
    }
  },
  {
    name: 'project-dburi',
    type: 'input',
    message: 'Development database:',
    default: 'mongodb://localhost/apier-dev',
    validate: input => {
      if (/(mongodb\:\/\/)/.test(input)) return true;
      return 'Must be a valid mongo URI';
    }
  },
  {
    name: 'project-secret',
    type: 'input',
    message: 'Security secret',
    default: generator.generate({ length: 32, numbers: true, symbols: true })
  }
];

const currentDir = process.cwd();

const buildProject = (path, name, port, db, secret) => {
  try {
    const projectDirExists = fs.existsSync(path);
    if (projectDirExists)
      return console.error('Project directory already exists');
    const gitCloneProject = spawn(
      `git clone https://github.com/phytertek/apier.git ${name} && cd ${
        name
      } && git remote rm origin`,
      { shell: true }
    );
    const gitSpinner = new Spinner(
      `%s Cloning base Apier project to ${name}...`
    );
    gitSpinner.setSpinnerString(17);
    gitSpinner.start();
    gitCloneProject.on('error', error => {
      gitSpinner.stop(true);
      return console.error(error);
    });
    gitCloneProject.on('exit', () => {
      gitSpinner.stop(true);
      // Run setAppConfig && setPackageConfig
      ['appConfig.js', 'package.json'].forEach(fileName => {
        const filePath = `${path}/${fileName}`;
        const fileContents = fs.readFileSync(filePath, 'utf8');
        let newFileContents;
        if (fileName === 'appConfig.js')
          newFileContents = setAppConfig(fileContents, name, port, db, secret);
        if (fileName === 'package.json')
          newFileContents = setPackageConfig(fileContents, name);
        fs.writeFileSync(filePath, newFileContents, 'utf-8');
      });
      // run npm install
      const npmInstall = spawn(
        `cd ${
          name
        } && npm install && git add . && git commit -m "Project created"`,
        { shell: true }
      );
      const npmSpinner = new Spinner(`%s Building ${name}...`);
      npmSpinner.setSpinnerString(17);
      npmSpinner.start();
      npmInstall.on('exit', () => {
        npmSpinner.stop(true);
        console.log(`
          Build complete!

          Don't forget to start your mongo server before
          running ${name}!

          To start your ${name} development server,
          cd into ${name} and run:

          npm run start:dev

          Enjoy!`);
      });
    });
  } catch (error) {
    return console.error(error);
  }
};

const setAppConfig = (contents, name, port, db, secret) => {
  return contents
    .replace('Apier', name)
    .replace('Apier Dev DB', `${name} Dev DB`)
    .replace('3333', port)
    .replace('mongodb://localhost/apier-dev', db)
    .replace('a super secure JWT secret', secret);
};

const setPackageConfig = (contents, name) => {
  return contents
    .replace('"apier"', `"${name}"`)
    .replace(`"phytertek"`, `""`)
    .replace(`"https://github.com/phytertek/apier"`, `""`);
};

const run = async () => {
  const projectConfig = await inquirer.prompt(questions);
  const {
    'project-name': projectName,
    'project-port': projectPort,
    'project-dburi': projectDb,
    'project-secret': projectSecret
  } = projectConfig;
  const projectPath = `${currentDir}/${projectName}`;
  buildProject(projectPath, projectName, projectPort, projectDb, projectSecret);
};

console.log(`
***********************************************
*** Welcome to the Apier project generator! ***
***********************************************
***  Please answer the questions below to   ***
***  get started.                           ***
***********************************************
`);
run();
