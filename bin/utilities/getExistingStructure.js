module.exports = (currentDir) => {
  const appStructure = {
    Schema: {},
    Routes: {},
    Services: {}
  }
  const appConfig = require(`${currentDir}/appConfig.js`)
  Object.keys(appConfig.Components).forEach(component => {

    // Schema
    if (appConfig.Components[component].Schema) {
      const componentSchema = require(`${currentDir}/app/${component.toLowerCase()}/schema`)
      Object.keys(componentSchema).forEach(schemaName => {
        if (!appStructure.Schema[schemaName]) {
          appStructure.Schema[schemaName] = componentSchema[schemaName].Schema
        } else {
          Object.keys(componentSchema[schemaName].Schema).forEach(field => {
            appStructure.Schema[schemaName][field] = componentSchema[schemaName].Schema[field]
          })
        }
      })
    }

    // Routes
    if (appConfig.Components[component].Routes) {
      const componentRoutes = require(`${currentDir}/app/${component.toLowerCase()}/routes`)
      appStructure.Routes[component] = componentRoutes
    }

    //Services
    if (appConfig.Components[component].Services) {
      const componentServices = require(`${currentDir}/app/${component.toLowerCase()}/services`)
      appStructure.Services[component] = componentServices
    }
  })
  return appStructure
}