const { run } = require('./dist/index.js')
const { setFailed } = require('@actions/core')

run()
  .then((status) => process.exit(status))
  .catch((error) => setFailed(error.message));