const express = require('express')
const HMInterface = require('hm-interface')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')

module.exports = class ConfigServer {
  constructor (configPath) {
    this.app = express()
    this.port = 9501
    this.initRouting()
    this.logger = HMInterface.logger.logger('InfluxLoggerConfig')
    this.configPath = configPath
  }

  attach (influxLogger) {
    let self = this
    this.influxLogger = influxLogger
    this.influxLogger.on('ccuconnected', (logger) => {
      logger.fetchPrograms().then(progList => {
        self.progList = progList
      })

      logger.fetchDevices(true).then(deviceList => {
        self.rawDeviceList = deviceList
        self.deviceList = logger.processFilterList(self.rawDeviceList)
      })
    })
  }

  loadConfig () {
    let cfgFile = path.join(this.configPath, 'config.json')
    if (fs.existsSync(cfgFile)) {
      try {
        let config = JSON.parse(fs.readFileSync(cfgFile))
        if (config.ccuIP === undefined) {
          config.ccuIP = '127.0.0.1'
        }
        return config
      } catch (e) {
        console.log(e)
      }
    }
    return {ccuIP: '127.0.0.1'}
  }

  saveConfig (cfg) {
    let cfgFile = path.join(this.configPath, 'config.json')
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, ' ', 2))
  }

  initRouting () {
    let self = this
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use('/static', express.static(path.join(__dirname, 'static')))

    this.app.get('/', (req, res) => {
      res.redirect('/static/index.html')
    })

    this.app.get('/config', async (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      let msmtCount = await self.influxLogger.getMeasurementCount()
      let rtntPolicy = await self.influxLogger.getRetentionPolicies()

      res.end(JSON.stringify({
        config: self.loadConfig(),
        programs: self.progList,
        devices: self.deviceList,
        measurements: msmtCount,
        retentionPolicy: rtntPolicy
      }))
    })

    this.app.put('/ccu', (req, res) => {
      if ((req.body) && (req.body.ccu)) {
        let cfg = self.loadConfig()
        cfg.ccuIP = req.body.ccu
        self.saveConfig(cfg)
        self.influxLogger.reload()
        res.end(JSON.stringify({message: 'ok'}))
      }
    })

    this.app.post('/logitems', (req, res) => {
      if ((req.body) && (req.body.whitelist)) {
        // save the whitelist
        try {
          let items = JSON.parse(req.body.whitelist)
          self.influxLogger.saveWhitelist(items)
          self.influxLogger.reload()
          self.deviceList = self.influxLogger.processFilterList(self.rawDeviceList)
          res.end(JSON.stringify({message: 'ok'}))
        } catch (e) {
          res.end(JSON.stringify({error: e.message}))
        }
      }
    })

    this.app.post('/database', async (req, res) => {
      if ((req.body) && (req.body.options)) {
        let cfg = self.loadConfig()
        cfg.database = req.body.options
        self.saveConfig(cfg)
        self.influxLogger.connectDatabase(cfg.database)
        res.end(JSON.stringify({message: 'ok'}))
      }
    })

    this.app.post('/test', async (req, res) => {
      if ((req.body) && (req.body.options)) {
        self.influxLogger.testConnection(req.body.options).then((rslt) => {
          res.end(JSON.stringify(rslt))
        }).catch((e) => {
          res.end(JSON.stringify({error: e.message}))
        })
      }
    })

    this.app.post('/selectedItems', async (req, res) => {
      if ((req.body) && (req.body.selectedDps)) {
        try {
          let selDp = JSON.parse(req.body.selectedDps)
          self.influxLogger.setSelectedDatapoints(selDp)
          self.influxLogger.reload()
          self.deviceList = self.influxLogger.processFilterList(self.rawDeviceList)
          res.end(JSON.stringify({message: 'ok'}))
        } catch (e) {
          res.end(JSON.stringify({error: e.message}))
          console.log(e.stack)
        }
      }
    })
  }

  run () {
    let self = this
    this.app.listen(this.port, () => {
      self.logger.info('srv is running on port %s', self.port)
    })
  }
}
