import * as UI from '/static/js/ui.js'
import {Network} from '/static/js/network.js'

export class Admin {
  async showDatabaseSettings () {
    let self = this
    let content = $('#content')
    content.empty()

    content.append($('<h3>').append('Database Settings'))

    let dta = await this.network.makeApiRequest('GET', 'config', '')

    let influxData = dta.config.database || {}

    let devGrid = new UI.Grid('dbConfig')

    let oInfluxHost = new UI.Input('txInfluxHost', influxData.host, (e, inp, newValue) => {
      influxData.host = newValue
    }).setGroupLabel('Influx Host')

    devGrid.addRow().setClasses('gridline').addCell(UI.cell8, oInfluxHost)

    let oInfluxDatabase = new UI.Input('txInfluxDatabase', influxData.database, (e, inp, newValue) => {
      influxData.database = newValue
    }).setGroupLabel('Database')

    devGrid.addRow().setClasses('gridline').addCell(UI.cell8, oInfluxDatabase)

    let oInfluxUser = new UI.Input('txInfluxUser', influxData.username, (e, inp, newValue) => {
      influxData.username = newValue
    }).setGroupLabel('Username')

    devGrid.addRow().setClasses('gridline').addCell(UI.cell8, oInfluxUser)

    let oInfluxPassword = new UI.Input('txInfluxPassword', influxData.password, (e, inp, newValue) => {
      influxData.password = newValue
    }).setGroupLabel('Password').setPassword()

    devGrid.addRow().setClasses('gridline').addCell(UI.cell8, oInfluxPassword)

    let oInfluxRetPol = new UI.Input('txInfluxPassword', dta.retentionPolicy, (e, inp, newValue) => {

    }).setGroupLabel('Retention Policy')

    devGrid.addRow().setClasses('gridline').addCell(UI.cell8, oInfluxRetPol)

    let lblMessage = new UI.Label('msgFooter', '')
    devGrid.addRow().setClasses('gridline').addCell(UI.cell8, lblMessage)

    content.append(devGrid.render())

    if (dta.measurements) {
      lblMessage.setLabel(dta.measurements + ' measurements in database')
    }

    let btnGroup = new UI.ButtonGroup('saveTest')

    let btnSave = new UI.Button('btnSave', 'success', 'Save', () => {
      self.network.makeApiRequest('POST', 'database', {options: influxData}).then(result => {
        if (result) {
          if (result.error) {
            lblMessage.setLabel(result.error)
          } else {
            lblMessage.setLabel('Saved your settings. Connection to the database established')
            btnSave.setActive(true)
          }
        }
      })
    })
    btnSave.setActive(false)

    let btnTest = new UI.Button('btnTest', 'info', 'Test', async () => {
      self.network.makeApiRequest('POST', 'test', {options: influxData}).then(result => {
        if (result) {
          if (result.error) {
            lblMessage.setLabel(result.error)
          } else {
            lblMessage.setLabel('Test ok. Please save your settings')
            btnSave.setActive(true)
          }
        }
      }).catch((e) => {
        lblMessage.setLabel('Error while connecting to the database')
      })
    })

    btnGroup.addButton(btnTest)
    btnGroup.addButton(btnSave)

    let footer = $('#footer')
    footer.empty()
    footer.append(btnGroup.render())
  }

  async showCCUSettings () {
    let self = this
    let content = $('#content')
    content.empty()

    content.append($('<h3>').append('CCU Settings'))

    let dta = await this.network.makeApiRequest('GET', 'config', '')

    let ccuIP = dta.config.ccuIP || ''

    let devGrid = new UI.Grid('ccuConfig')

    let oCCUiP = new UI.Input('txCCUiP', ccuIP, (e, inp, newValue) => {
      ccuIP = newValue
    }).setGroupLabel('CCU IP')

    let btnSave = new UI.Button('btnSave', 'success', 'Save', () => {
      self.network.makeApiRequest('PUT', 'ccu', {ccu: ccuIP})
    })

    let row = devGrid.addRow().setClasses('gridline')
    row.addCell(UI.cell8, oCCUiP)
    row.addCell(UI.cell3, btnSave.render())
    content.append(devGrid.render())

    content.append($('<br>'))
    this.showWhitelist(content, dta.config)
    this.showDeviceList(content, dta.devices)
    let footer = $('#footer')
    footer.empty()
  }

  showWhitelist (content, dta) {
    let self = this
    if (dta.whitelist === undefined) {
      dta.whitelist = []
    }
    content.append($('<h3>').append('Whitelist'))
    let grid1 = new UI.DatabaseGrid('grid1', undefined, {})

    grid1.setBeforeQuery(() => {
      grid1.dataset = dta.whitelist
    })

    grid1.setTitleLabels(['Log Datapoints that match .... (if you want to log all humidity for example just type .HUMIDITY)', ''])
    grid1.setColumns([
      {sz: UI.cell6, sort: 0},
      {sz: UI.cell4}
    ])

    grid1.setRenderer((row, item) => {
      if (item) {
        row.setClasses('gridline')
        return [
          new UI.Input(item.id, item.value, (e, inp, newValue) => {
            item.value = newValue
          }),
          new UI.Button('btn' + item.id, 'danger', 'Delete', () => {
            let filtered = dta.whitelist.filter(function (el) {
              return el.id !== item.id
            })

            dta.whitelist = filtered

            grid1.refresh()
          })
        ]
      }
    })
    content.append(grid1.render())

    let btnGroup = new UI.ButtonGroup('whiteList')
    let btnNew = new UI.Button('btnNew', 'info', 'New whitelist item', () => {
      let nextid = Object.keys(dta.whitelist).length
      dta.whitelist.push({id: nextid, value: ''})
      grid1.refresh()
    })

    let btnSave = new UI.Button('btnSave', 'success', 'Save whitelist', () => {
      self.network.makeApiRequest('POST', 'logitems', {whitelist: JSON.stringify(dta.whitelist)}).then(() => {
        self.showCCUSettings()
      })
    })

    btnGroup.addButton(btnNew)
    btnGroup.addButton(btnSave)

    content.append(btnGroup.render())
  }

  showDeviceList (content, dta) {
    content.append($('<br><br>'))
    content.append($('<h3>').append('CCU Devices'))
    let tree = $('<div>').attr('id', 'tree')
    content.append(tree)
    let self = this
    var treeData = []
    var selectedDps = []
    if (dta) {
      dta.forEach(device => {
        let dNode = {text: device.name,
          nodes: [],
          state: {
            checked: false,
            disabled: false,
            expanded: false,
            selected: false,
            checkable: false
          }}
        device.channels.forEach(channel => {
          let cNode = {text: channel.name,
            nodes: [],
            state: {
              checked: false,
              disabled: false,
              expanded: false,
              selected: false,
              checkable: false
            }
          }
          dNode.nodes.push(cNode)
          channel.datapoints.forEach(dp => {
            let wlChecked = ((device.wl !== undefined) && (device.wl.indexOf(dp.name) > -1))
            let dpIsSeected = dp.selected
            let text = dp.name
            if (wlChecked) {
              text = text + ' (whitelist enabled)'
            }

            if ((wlChecked) || (dpIsSeected)) { // mark the parents
              cNode.state.partlyChecked = true
              dNode.state.partlyChecked = true
            }

            if (dpIsSeected) {
              selectedDps.push(dp.name)
            }

            cNode.nodes.push({text: text,
              state: {
                checked: wlChecked || dpIsSeected,
                disabled: wlChecked,
                expanded: false,
                selected: false,
                checkable: true
              }})
          })
        })
        treeData.push(dNode)
      })

      $('#tree').treeview({
        data: treeData,
        showIcon: false,
        showCheckbox: true,
        onNodeChecked: function (event, node) {
          selectedDps.push(node.text)
        },
        onNodeUnchecked: function (event, node) {
          selectedDps = selectedDps.filter(value => {
            return value !== node.text
          })
        }
      })

      let btnSave = new UI.Button('btnSave', 'success', 'Save selection', () => {
        self.network.makeApiRequest('POST', 'selectedItems', {selectedDps: JSON.stringify(selectedDps)}).then(() => {
          self.showCCUSettings()
        })
      })
      content.append('<br />')
      content.append(btnSave.render())
    } else {
      content.append('fetching devices is still running.')
    }
  }

  run () {
    let self = this
    this.network = new Network()
    $('#btnDatabase').bind('click', () => {
      self.showDatabaseSettings()
    })

    $('#btnCCU').bind('click', () => {
      self.showCCUSettings()
    })

    this.showDatabaseSettings()
  }
}
