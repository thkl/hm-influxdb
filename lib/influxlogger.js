const Influx = require('influx')
const HMInterface = require('hm-interface')
const Url = require('url')
const path = require('path')
const fs = require('fs')
const { EventEmitter } = require('events')
const os = require('os')

const influxSchema = {
  measurement: 'logging',
  fields: {
    value: Influx.FieldType.INTEGER
  },
  tags: ['source', 'address', 'name', 'room', 'type']
}

module.exports = class InfluxLogger extends EventEmitter {
  constructor (configPath) {
    super()
    this.connected = false
    this.loggingBuffer = []
    this.logger = HMInterface.logger.logger('InfluxLogger')
    this.configPath = configPath
    this.reload()
  }

  loadWhitelist () {
    let self = this
    this.whitelist = []
    if (this.configuration.whitelist) {
      Object.keys(this.configuration.whitelist).forEach(key => {
        self.whitelist.push(self.configuration.whitelist[key])
      })
    }

    this.programlist = []
    if (this.configuration.programlist) {
      Object.keys(this.configuration.programlist).forEach(key => {
        self.programlist.push(self.configuration.programlist[key])
      })
    }
  }

  reload () {
    let cfgFile = path.join(this.configPath, 'config.json')
    if (fs.existsSync(cfgFile)) {
      this.logger.info('Config found')
      this.configuration = JSON.parse(fs.readFileSync(cfgFile))
    } else {
      this.configuration = {}
      this.configuration.ccuIP = '127.0.0.1'
    }
    this.portRpl = {'BidCos-RF': 2001, 'VirtualDevices': 9292, 'HmIP-RF': 2010}
    // setup a local ccu
    this.init()
  }

  getConfig () {
    let cfgFile = path.join(this.configPath, 'config.json')
    if (fs.existsSync(cfgFile)) {
      return JSON.parse(fs.readFileSync(cfgFile))
    } else {
      return false
    }
  }

  saveConfig (cfg) {
    let cfgFile = path.join(this.configPath, 'config.json')
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, ' ', 2))
  }

  async init () {
    let self = this

    this.loggingHost = os.hostname()

    if (this.configuration) {
      this.loadWhitelist()

      if (this.whitelist) {
        if (this.interfaceClientManager) {
          this.logger.info('Removing old Intefaces')
          await this.interfaceClientManager.stop()
          this.logger.info('Done')
        }
        if (this.configuration.database) {
          this.connectDatabase(this.configuration.database)
        } else {
          this.logger.info('Missing Database Settings ...')
        }
        this.interfaceClientManager = new HMInterface.HomematicClientInterfaceManager({clientName: 'cfl', timeout: 600, port: 9500})
        this.logger.info(JSON.stringify(this.whitelist))
        this.interfaceClientManager.on('event', message => {
          let eventChannelName = '-'
          let channelRoom = '-'

          // check whitelist filter
          let flt = self.whitelist.filter(entry => {
            return (message.address.indexOf(entry.value) > -1)
          })

          let dpfl = []
          if ((flt.length === 0) && (self.configuration.datapoints)) {
            dpfl = self.configuration.datapoints.filter(entry => {
              return message.address === entry
            })
          }

          if ((flt.length > 0) || (dpfl.length > 0)) {
            let hmAddress = new HMInterface.HomeMaticAddress(message.address)
            let devs = self.regaClient.deviceByDatapointAddress(message.address)
            if (devs) {
              eventChannelName = devs.getChannelName(hmAddress.channelAddress())
              let channel = self.regaClient.channelByDatapointAddress(message.address)
              if ((channel) && (channel.room)) {
                channelRoom = channel.room.name
              }
            }
            self.logger.debug('Logging %s with value %s', message.address, message.value)

            let point = {
              measurement: 'logging',
              tags: {source: self.loggingHost, address: message.address, type: message.datapoint, name: eventChannelName, room: channelRoom},
              fields: {
                value: message.value
              },
              timestamp: new Date()
            }

            self.addToBuffer(point)
          }
        })

        if (this.configuration.ccuIP) {
          this.connectCCU()
        }
      } else {
        this.logger.warn('Config is missing so skip that for the moment')
      }
    } else {
      this.logger.warn('No whitelist found .. nothing to log')
    }
  }

  addToBuffer (point) {
    this.logger.debug('Adding %s', JSON.stringify(point))
    this.loggingBuffer.push(point)
    let bufferSize = this.configuration.bufferSize || 50
    if (this.loggingBuffer.length > bufferSize) {
      this.saveBuffer()
    }
  }

  saveBuffer () {
    if ((this.influx) && (this.connected)) {
      try {
        this.logger.debug('Saving Buffer %s to database', JSON.stringify(this.loggingBuffer))
        this.influx.writePoints(this.loggingBuffer)
        this.loggingBuffer = []
      } catch (e) {
        this.logger.error(e)
      }
    } else {
      this.logger.error('Unable to save buffer. database not set or connected')
    }
  }

  async connectCCU () {
    let self = this
    // ask rega about the interfaces and connect
    this.logger.info(`Query Interfaces from ${this.configuration.ccuIP}`)
    this.regaClient = new HMInterface.HomeMaticRegaManager({ccuIP: this.configuration.ccuIP})
    // load Interfaces
    this.regaClient.fetchInterfaces().then(interfaceList => {
      interfaceList.forEach(oInterface => {
        if ((oInterface.url !== undefined) && (oInterface.url.length > 1)) {
          // rebuild the urls for parsing
          let url = oInterface.url
          url = url.replace('xmlrpc_bin://', 'http://')
          url = url.replace('xmlrpc://', 'http://')
          let oUrl = Url.parse(url)
          let port = self.portRpl[oInterface.name]
          if (port === undefined) {
            port = oUrl.port
          }
          let host = (oUrl.hostname === '127.0.0.1') ? self.configuration.ccuIP : oUrl.hostname
          self.logger.info(`Adding interface ${oInterface.name} on Host ${host} Port ${port}`)
          self.interfaceClientManager.addInterface(oInterface.name, host, port, oUrl.pathname)
        }
      })
    }).catch(error => {
      this.log.error(error)
    })
    this.logger.info(`Query DeviceList  ${this.configuration.ccuIP}`)
    await this.regaClient.fetchDevices()
    this.logger.info('Devicelist done')
    await this.regaClient.fetchRooms().then
    this.logger.info('Roomlist done')
    // attach to interfaces
    this.interfaceClientManager.init()
    this.interfaceClientManager.connect()
    this.emit('ccuconnected', this)
    setInterval(() => {
      self.updatePrograms()
    }, 60000)
    this.updatePrograms()
  }

  fetchPrograms () {
    let self = this
    return new Promise((resolve, reject) => {
      self.regaClient.fetchPrograms().then(progList => {
        resolve(progList)
      })
    })
  }

  fetchDevices (includeDPs) {
    let self = this
    return new Promise((resolve, reject) => {
      self.regaClient.fetchDevices(includeDPs).then(deviceList => {
        resolve(deviceList)
      })
    })
  }

  processFilterList (deviceList) {
    let self = this
    let dpList = this.configuration.datapoints || []
    deviceList.forEach(device => {
      device.wl = undefined
      device.inWhitelist = undefined
      device.channels.forEach(channel => {
        channel.datapoints.forEach(datapoint => {
          let flt = self.whitelist.filter(entry => {
            return (datapoint.name.indexOf(entry.value) > -1)
          })

          if (dpList.indexOf(datapoint.name) > -1) {
            datapoint.selected = true
          }

          if (flt.length > 0) {
            device.inWhitelist = true
            if (!device.wl) {
              device.wl = []
            }
            device.wl.push(datapoint.name)
          }
        })
      })
    })
    return deviceList
  }

  setSelectedDatapoints (dpsList) {
    // run thru the list and check if DPS are here
    let listToSave = []
    if (dpsList) {
      dpsList.forEach(dp => {
        listToSave.push(dp)
      })
      let cfg = this.getConfig()
      if (cfg) {
        cfg.datapoints = listToSave
        this.saveConfig(cfg)
      }
    }
  }

  saveWhitelist (whiteList) {
    let cfg = this.getConfig()
    if (cfg === false) {
      cfg = {}
    }

    cfg.whitelist = whiteList
    this.saveConfig(cfg)
  }

  async updatePrograms () {
    let self = this
    let prgList = await this.regaClient.fetchProgrambyIDs(self.programlist || [])
    prgList.forEach(prg => {
      if (prg.lastRunChanged) {
        this.logger.info('adding %s', prg.name)
        let lrUtc = prg.lastRun * 1000
        self.addToBuffer({measurement: 'logging', tags: {address: prg.id, type: 'PROGRAM', name: prg.name, room: '-'}, fields: {value: 1}, timestamp: new Date(lrUtc)})
        // switch back 1 second later
        self.addToBuffer({measurement: 'logging', tags: {address: prg.id, type: 'PROGRAM', name: prg.name, room: '-'}, fields: {value: 0}, timestamp: new Date(lrUtc + 5000)})
      }
    })
  }

  stop () {
    let self = this
    return new Promise(async (resolve, reject) => {
      if (self.interfaceClientManager) {
        try {
          await self.interfaceClientManager.stop()
        } catch (e) {
          self.logger.error(e)
        }
      }
      self.saveBuffer()
      resolve()
    })
  }

  establishDatabaseConntection (options, dryrun) {
    this.logger.info('Init InfluxDB')
    let self = this
    return new Promise((resolve, reject) => {
      options.schema = [influxSchema]
      let influx = new Influx.InfluxDB(options)
      influx.ping(1000).then(hosts => {
        hosts.forEach(host => {
          if (!host.online) {
            reject(new Error('unreachable host'))
          } else {
            let dbFound = false

            influx.getDatabaseNames().then(names => {
              if (names.indexOf(options.database) > -1) {
                dbFound = true
              }

              if (!dbFound) {
                influx.createDatabase(options.database).then(() => {
                  influx.query('CREATE RETENTION POLICY "global" ON ' + options.database + ' DURATION ' + options.retention + 'd REPLICATION 1 DEFAULT', err => {
                    if (err) {
                      reject(err)
                    } else {
                      if (dryrun === true) {
                        influx.query('DELETE ' + options.database)
                      } else {
                        self.influx = influx
                        self.connected = true
                      }
                      // remove the database we will create
                      resolve({message: 'ok'})
                    }
                  })
                }).catch((e) => {
                  reject(e)
                })
              }
              if (dryrun === false) {
                self.influx = influx
                self.connected = true
                self.logger.info('Database connection initialized')
              }
              resolve({message: 'ok'})
            }).catch((e) => {
              reject(e)
            })
          }
        })
      }).catch((e) => {
        let error = new Error('timeout')
        error.code = 501
        reject(error)
      })
    })
  }

  testConnection (options) {
    if (options.retention === undefined) {
      options.retention = 30
    }
    return this.establishDatabaseConntection(options, true)
  }

  connectDatabase (options) {
    let self = this
    if (options.retention === undefined) {
      options.retention = 30
    }
    this.establishDatabaseConntection(options, false).then().catch(e => {
      if ((e) && (e.code === 501)) {
        setTimeout(() => {
          // try again
          self.connectDatabase(options)
        }, 30000)
      }
    })
  }
}
