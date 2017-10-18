const {
  getAll{{component}}s,
  get{{component}},
  create{{component}},
  update{{component}},
  delete{{component}}
} = require('./controllers')
{{requireAuth}}

module.exports = {
  '{{component}}': {
    {{addrequireAuth}}
    get: {
      '/get-all': getAll{{component}}s,
      '/get/:id': get{{component}}
    },
    post: {
      '/create': create{{component}}
    },
    patch: {
      '/update': update{{component}}
    },
    delete: {
      '/delete': delete{{component}}
    }
  }
}