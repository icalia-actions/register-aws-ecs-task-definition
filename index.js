const { run } = require('./dist/index.js')

run()
  .then((status) => process.exit(status))
  .catch((error) => { console.error(error.message) ; process.exit(1) })