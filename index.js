const path = require('path')
const program = require('commander')
const ConfigServer = require(path.join(__dirname, 'lib', 'configserver.js'))
const InfluxLogger = require(path.join(__dirname, 'lib', 'influxlogger.js'))
const HMInterface = require('hm-interface')

let lfgPath = path.join('/', 'etc', 'config', 'addons', 'hm-influxdb')

program.option('-D, --debug', 'turn on debug level logging', () => {
  HMInterface.logger.setDebugEnabled(true)
})

program.option('-C, --config [path]', 'set config path', (path) => {
  lfgPath = path
})

program.parse(process.argv)

let logger = HMInterface.logger.logger('Main')
logger.info('Config Path is %s', lfgPath)

let il = new InfluxLogger(lfgPath)

let cs = new ConfigServer(lfgPath)
cs.attach(il)
cs.run()

process.on('SIGINT', async (code) => {
  await il.stop()
  process.exit()
})
