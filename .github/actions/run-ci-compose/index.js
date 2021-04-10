#!/usr/bin/env node

const fs = require('fs')
const { spawn } = require('child_process')

async function runService(serviceName, containerCommand) {
  let args = [
    '-f',
    'docker-compose.yml',
    '-f',
    'ci-compose.yml',
    'run',
    '--rm',
    serviceName
  ]

  if (containerCommand) {
    containerCommand = containerCommand.split(' ').map(arg => arg.trim())
    args = args.concat(containerCommand)
  }

  const command = spawn('docker-compose', args, { stdio: 'inherit' })
  
  const exitCode = await new Promise( (resolve, reject) => {
    command.on('close', resolve)
  })

  return exitCode;
}


async function run() {
  if (!fs.existsSync('ci-compose.yml')) throw('No ci-compose file exists')

  const serviceName = process.env['INPUT_SERVICE-NAME']
  if (!serviceName) throw('A service-name must be given')

  const command = process.env['INPUT_COMMAND']

  return await runService(serviceName, command)
}

run()
  .then(status => process.exit(status))
  .catch(error => { console.error(error) ; process.exit(1) })