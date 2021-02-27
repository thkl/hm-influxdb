
export const cell1 = { md: 1, lg: 1, xl: 1, sz: 6 }
export const cell2 = { md: 2, lg: 2, xl: 2, sz: 6 }
export const cell3 = { md: 3, lg: 3, xl: 3, sz: 6 }
export const cell4 = { md: 4, lg: 4, xl: 4, sz: 6 }
export const cell5 = { md: 5, lg: 5, xl: 5, sz: 6 }
export const cell6 = { md: 6, lg: 6, xl: 6, sz: 6 }
export const cell7 = { md: 7, lg: 7, xl: 7, sz: 6 }
export const cell8 = { md: 8, lg: 8, xl: 8, sz: 6 }
export const cell9 = { md: 9, lg: 9, xl: 9, sz: 6 }
export const cell10 = { md: 10, lg: 10, xl: 10, sz: 6 }
export const cell11 = { md: 11, lg: 11, xl: 11, sz: 6 }
export const cell12 = { md: 12, lg: 12, xl: 12, sz: 6 }

export class UIElement {
  constructor (id) {
    if (arguments.length < 1) {
      throw new Error('invalid number of arguments')
    }
    this.id = id
    this.bindings = []
  }

  bind (event, callback, element) {
    this.bindings.push({ event: event, element: element, callback: callback })
    return this
  }

  _processBindings (element) {
    this.bindings.map(bndg => {
      let evnt = bndg.event
      let emtr = element
      if (bndg.element) {
        emtr = bndg.element
      }
      if (evnt === 'click') {
        emtr.addClass('clickable')
      }
      return emtr.bind(evnt, bndg.callback)
    })
    return this
  }
}

export class Label extends UIElement {
  constructor (id, text) {
    if (arguments.length < 2) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.label = $('<div>')
    this.text = text
  }

  setStyle (style) {
    this.label.attr('style', style)
    return this
  }

  addClass (clazz) {
    this.label.addClass(clazz)
    return this
  }

  setLabel (text) {
    this.text = text
    if (this.label) {
      this.label.empty()
      this.label.append(this.text)
    }
    return this
  }

  render () {
    this._processBindings(this.label)
    this.label.empty()
    this.label.append(this.text)
    return this.label
  }
}

export class Spinner extends UIElement {
  constructor (id) {
    if (arguments.length < 1) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.spinner = $('<div>').attr('role', 'status')
  }

  setActive (active) {
    if (active === true) {
      this.spinner.addClass('spinner-border')
    } else {
      this.spinner.removeClass('spinner-border')
    }
  }

  render () {
    return this.spinner
  }
}

export class Button extends UIElement {
  constructor (id, type, title, onClick, enabled = true) {
    if (arguments.length < 4) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.isActive = enabled
    this.button = $('<button>')
    this.button.attr(id, this.id)
    this.title = title
    this.bind('click', onClick)
    this.enabled = enabled
    this.type = type
  }

  setStyle (style) {
    this.button.attr('style', style)
    return this
  }

  setLabel (lbl) {
    this.button.empty()
    this.button.append(lbl)
    return this
  }

  setIcon (icon) {
    this.icon = icon
    return this
  }

  setActive (isActive) {
    this.isActive = isActive
    if (this.isActive) {
      this.button.removeAttr('disabled')
      this.button.addClass('active')
    } else {
      this.button.removeClass('active')
      this.button.attr('disabled', 'disabled')
    }
    return this
  }

  render () {
    let self = this
    this._processBindings(this.button)
    this.button.attr('type', 'button')
    this.button.addClass('btn')

    this.button.addClass('btn-' + this.type)
    if (this.isActive) {
      this.button.addClass('active')
    } else {
      this.button.attr('disabled', 'disabled')
    }

    if (this.icon) {
      let iSpan = $('<span>')
      iSpan.addClass('mr-2')
      iSpan.addClass('btn-icon')
      iSpan.addClass(this.icon)
      this.button.append(iSpan)
    }
    this.button.append(self.title)

    return this.button
  }
}

export class Input extends UIElement {
  constructor (id, value, onChange, eType = '<input>') {
    if (arguments.length < 2) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.input = $(eType).attr('id', id)
    let self = this
    if (onChange) {
      this.bind('change', (e) => {
        onChange(e, e.target, self.getValue())
      })
    }

    this.input.addClass('form-control')
    this.input.val(value)
    this.oValue = value
  }

  setPassword () {
    this.input.attr('type', 'password')
    return this
  }

  onChange (callback) {
    this.input.bind('change', (e) => {
      callback(e, e.target)
    })
    return this
  }

  setStyle (style) {
    this.style = style
    if (this.container) {
      this.container.attr('style', this.style)
    }
    return this
  }

  setLabel (label) {
    this.label = $('<label>').attr('for', this.id)
    this.label.append(label)
    return this
  }

  setGroupLabel (label) {
    this.label = $('<div>').addClass('input-group-prepend')
    let span = $('<span>').addClass('input-group-text').append(label)
    this.label.append(span)
    this.isGrouped = true
    return this
  }

  addButton (title, onClick) {
    if (!this.inputGroupAppend) {
      this.inputGroupAppend = $('<div>').addClass('input-group-append')
    }
    let spn = $('<span>').addClass('input-group-text').append(title)
    if (onClick) {
      this.bind('click', onClick, spn)
    }
    this.inputGroupAppend.append(spn)
    return this
  }

  setEnabled (enabled) {
    if (enabled) {
      this.input.removeAttr('disabled', 'disabled')
    } else {
      this.input.attr('disabled', 'disabled')
    }
    return this
  }

  getFiles (id) {
    if (this.inputType === 'file') {
      return this.input[0].files[id]
    }
    return undefined
  }

  setType (inputType) {
    this.inputType = inputType
    return this
  }

  setValue (newValue) {
    this.input.val(newValue)
    return this
  }

  getValue () {
    return this.input.val()
  }

  render () {
    this._processBindings(this.input)
    if (this.label) {
      if (this.isGrouped === true) {
        this.container = $('<div>').addClass('input-group')
        this.container.append(this.label)
        this.container.append(this.input)
      } else {
        this.container = $('<div>').append(this.label).append(this.input)
      }
      if (this.style) {
        this.container.attr('style', this.style)
      }
      if (this.inputType) {
        this.input.attr('type', this.inputType)
      }

      if (this.inputGroupAppend) {
        this.container.append(this.inputGroupAppend)
        this.input.attr('style', 'width:60%')
      }

      return this.container
    } else {
      return this.input
    }
  }
}

export class CheckBox extends Input {
  constructor (id, value, onChange) {
    super(id, 'true', onChange)
    this.input.attr('type', 'checkbox')
    this.setValue(value)
  }

  setLabel (label) {
    this.label = $('<label>').attr('for', this.id)
    this.label.addClass('form-check-label')
    this.input.removeClass('form-control')
    this.input.addClass('form-check-input')
    this.label.append(label)
  }

  setValue (newValue) {
    if (newValue === true) {
      this.input.attr('checked', 'checked')
    } else {
      this.input.removeAttr('checked')
    }
  }

  getValue () {
    return (this.input.attr('checked') === 'checked')
  }

  render () {
    if (this.label) {
      let result = $('<div>').append(this.input).append(this.label)
      result.addClass('form-check')
      return result
    } else {
      return this.input
    }
  }
}

export class ButtonInput extends UIElement {
  constructor (id, value, title, onChange, onButton) {
    if (arguments.length < 3) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.container = $('<div>').addClass('input-group mb-3')
    this.input = $('<input>').attr('id', id)

    this.bind('change',
      (e) => {
        onChange(e, e.target)
      }, this.input)

    this.input.addClass('form-control')
    this.input.val(value)
    this.container.append(this.input)

    this.inputGroupAppend = $('<div>').addClass('input-group-append')
    let button = $('<button>').addClass('btn btn-secondary').attr('type', 'button').append(title)

    if (onButton) {
      this.bind('click',
        (e) => {
          onButton(e, e.target)
        }, button)
    }

    this.inputGroupAppend.append(button)
    this.container.append(this.inputGroupAppend)
  }

  setLabel (label) {
    this.label = $('<label>').attr('for', this.id)
    this.label.append(label)
  }

  setValue (newValue) {
    this.input.val(newValue)
    this.input.change() // trigger the change event
  }

  getValue () {
    return this.input.val()
  }

  setStyle (style) {
    this.style = style
    if (this.container) {
      this.container.attr('style', this.style)
    }
  }

  setGroupLabel (label) {
    this.label = $('<div>').addClass('input-group-prepend')

    let span = $('<span>').addClass('input-group-text').append(label)
    this.label.append(span)
    this.isGrouped = true
  }

  addButton (button) {
    if (!this.inputGroupAppend) {
      this.inputGroupAppend = $('<div>').addClass('input-group-append')
    }
    this.inputGroupAppend.append(button.render())
  }

  render () {
    this._processBindings(this.input)
    if (this.label) {
      if (this.isGrouped === true) {
        this.container = $('<div>').addClass('input-group')
        this.container.append(this.label)
        this.container.append(this.input)
      } else {
        this.container = $('<div>').addClass('input-group').append(this.label).append(this.input)
      }
      if (this.style) {
        this.container.attr('style', this.style)
      }
      if (this.inputType) {
        this.input.attr('type', this.inputType)
      }
      if (this.inputGroupAppend) {
        this.container.append(this.inputGroupAppend)
        this.input.attr('style', 'width:60%')
      }
      return this.container
    } else {
      return this.container
    }
  }
}

export class Dropdown extends UIElement {
  constructor (id, title, onChange) {
    if (arguments.length < 2) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.items = []
    this.title = title
    this.bind('change', onChange)
  }
  setTitle (newTitle) {
    this.button.empty()
    this.button.append(newTitle)
    return this
  }

  reset () {
    this.items.empty()
    return this
  }

  addItem (item) {
    this.items.push(item)
    return this
  }

  render () {
    let self = this
    if (this.dropDown) {
      this.dropDown.empty()
    } else {
      this.dropDown = $('<div>').addClass('btn-group').attr('style', 'width: 100%;')
    }
    this.button = $('<button>').attr('class', 'btn btn-secondary dropdown-toggle').attr('type', 'button')
    this.button.attr('id', 'dropdownMenuButton_' + this.id)
    this.button.attr('data-toggle', 'dropdown')
    this.button.attr('aria-expanded', false)
    this.button.append(this.title)
    this.dropDown.append(this.button)
    this.dropDownItems = $('<div>').addClass('dropdown-menu').attr('aria-labelledby', 'dropdownMenuButton_' + this.id)
    this.dropDown.append(this.dropDownItems)

    this.items.map(item => {
      let mItem = $('<button>').addClass('dropdown-item').attr('type', 'button').attr('data-value', item.value).append(item.title)
      mItem.attr('data-title', item.title)
      mItem.bind('click', (e) => {
        self.setTitle(e.target.getAttribute('data-title'))
        if (item.onClick) {
          item.onClick(e, e.target.getAttribute('data-value'))
        }
        // check if we have a binding for onChange
        self.bindings.map((bndg) => {
          let evnt = bndg.event
          if (evnt === 'change') {
            bndg.callback(e.target.getAttribute('data-value'))
          }
        })
      })
      this.dropDownItems.append(mItem)
    })

    return this.dropDown
  }
}

export class Pagination {
  constructor (parent) {
    this.parent = parent
    this.pages = []
    this.maxPages = 8
    this.curStartPage = 0
  }

  addPage (id, isActive, title, start, onClick) {
    this.pages.push({ id: id, isActive: isActive, title: title, start: start, onClick: onClick })
  }

  setParent (parent) {
    this.parent = parent
  }

  setActivePage (pageNum) {
    this.activePage = pageNum
    this.pages.map(page => {
      page.isActive = (page.id === pageNum)
    })
    this.render()
  }

  reset () {
    this.pages = []
    this.curStartPage = 0
  }

  renderPage (num, title, active, enabled, callback) {
    let oLi = $('<li>').addClass('page-item')
    if (enabled) {
      oLi.attr('disabled', 'disabled')
    }

    if (active) {
      oLi.addClass('active')
    }
    let oAnc = $('<a>').addClass('page-link')
    oAnc.on('click', (e) => {
      if (callback) {
        callback(e, num)
      }
    })
    oAnc.attr('style', 'cursor:pointer')
    oAnc.append(title)
    oLi.append(oAnc)
    return oLi
  }

  render () {
    let self = this
    this.parent.empty()
    let canvas = this.parent
    if (!canvas.is('ul')) {
      canvas = $('<ul>')
      canvas.addClass('pagination')
      this.parent.append(canvas)
    }

    let lastPage = this.pages.length

    if (this.pages.length > this.maxPages) {
      let active = (this.curStartPage !== 0)
      let opage = this.renderPage(-1, (this.prevTitle || 'Previous'), false, active, (e, num) => {
        if (self.curStartPage > 0) {
          self.curStartPage = self.curStartPage - 1
        }
        self.render()
      })
      canvas.append(opage)
      lastPage = this.curStartPage + this.maxPages
    }

    for (var i = this.curStartPage; i < lastPage; i++) {
      let page = this.pages[i]
      if (page) {
        let opage = this.renderPage(page.id, page.title, page.isActive, true, (e, num) => {
          page.onClick(e, page)
        })
        canvas.append(opage)
      }
    }

    if (this.pages.length > this.maxPages) {
      let active = (this.curStartPage !== 0)
      let opage = this.renderPage(-1, (this.NextTitle || 'Next'), false, active, (e, num) => {
        if (self.curStartPage < (self.pages.length - self.maxPages)) {
          self.curStartPage = self.curStartPage + 1
        }
        self.render()
      })
      canvas.append(opage)
    }
  }
}

export class Dialog {
  constructor (settings) {
    this.dialogId = settings.dialogId
    this.dialog = $('<div>').attr('class', 'modal fade').attr('tabindex', '-1').attr('role', 'dialog').attr('id', settings.dialogId)
    let dDocument = $('<div>').attr('class', 'modal-dialog').attr('role', 'document')

    if (settings.dialogClass) {
      dDocument.addClass(settings.dialogClass)
    }

    if (settings.size) {
      dDocument.addClass(settings.size)
    } else {
      dDocument.addClass('modal-lg')
    }

    if (settings.scrollable) {
      dDocument.addClass('modal-dialog-scrollable')
    }

    this.dialog.append(dDocument)

    let dContent = $('<div>').addClass('modal-content')
    dDocument.append(dContent)

    let dHeader = $('<div>').addClass('modal-header')
    dContent.append(dHeader)

    if (settings.title) {
      let dTitle = $('<h5>').addClass('modal-title').attr('id', settings.dialogId + '_title')
      dTitle.append(settings.title)
      dHeader.append(dTitle)
    }

    let dCloseButton = $('<button>').attr('type', 'button').attr('class', 'close').attr('data-dismiss', 'modal')
    if (settings.labelClose) {
      dCloseButton.attr('aria-label', settings.labelClose)
    } else {
      dCloseButton.attr('aria-label', 'Close')
    }

    dCloseButton.append($('<span>').attr('aria-hidden', 'true').append('&times;'))
    dHeader.append(dCloseButton)

    this.body = $('<div>').addClass('modal-body').attr('id', settings.dialogId + '_content')
    dContent.append(this.body)

    let dFooter = $('<div>').addClass('modal-footer')
    dContent.append(dFooter)

    if (settings.buttons) {
      settings.buttons.map(button => {
        if (button) {
          dFooter.append(button.render())
        }
      })
    }
  }

  setBody (item) {
    let self = this
    this.body.empty()
    if (typeof item === 'object') {
      if (Array.isArray(item)) {
        item.map(iitem => {
          self.body.append(iitem)
        })
      } else {
        this.body.append(item)
      }
    } else {
      this.body.append(item)
    }
  }

  open () {
    let self = this
    $('body').append(this.dialog)

    $('#' + this.dialogId)
      .on('hide.bs.modal', (e) => {
        if (self.beforeClose) {
          self.beforeClose()
        }
      })

    $('#' + this.dialogId)
      .on('hidden.bs.modal', (e) => {
        setTimeout(() => {
          self.dialog.remove()
        }, 50)
      })

    this.dialog.modal()
  }

  close () {
    this.dialog.modal('hide')
  }
}

export class GridCell extends UIElement {
  constructor (id, szData, content, clazz) {
    super(id)
    this.oCell = $('<div>')
    this.szData = szData
    this.content = content
    this.clazz = clazz
  }

  setContent (content) {
    this.content = content
  }

  render () {
    this._processBindings(this.oCell)
    if (this.szData) {
      this.oCell.addClass('col-sm-' + (this.szData.sm || 12))
      this.oCell.addClass('col-md-' + (this.szData.md || 6))
      this.oCell.addClass('col-lg-' + (this.szData.lg || 3))
      this.oCell.addClass('col-xl-' + (this.szData.xl || this.szData.lg || 3))
    } else {
      this.oCell.addClass('col-auto')
    }

    if ((typeof this.content === 'object') && (typeof this.content.render === 'function')) {
      this.oCell.append(this.content.render())
    } else {
      this.oCell.append(this.content)
    }
    return this.oCell
  }
}

export class GridRow extends UIElement {
  constructor (id, settings = {}) {
    if (arguments.length < 1) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.cells = []
    this.settings = settings
  }

  addCell (szData, content, clazz, id = 'c1') {
    let self = this
    var cContent = content

    if (typeof content !== 'object') {
      cContent = $('<span>').append(content)
    } else {
      if (content.constructor.name === 'Input') {
        if (this.grid) {
          let frmV = this.grid.getElementValue(content.id)
          if (frmV) {
            content.setValue(frmV)
          }
        }
        cContent = $('<span>').append(content.render())
        content.onChange((e, t) => {
          self.grid.setFormChange(content.id, content.getValue())
        })
      }
    }
    this.cells.push(new GridCell(this.id + '_' + id, szData, cContent, clazz))
    return cContent
  }

  setClasses (classNames) {
    this.cssClazzName = classNames
    return this
  }

  hide () {
    this.domObj.hide()
    return this
  }

  getCell (id) {
    let self = this
    let aCells = this.cells.filter((cell) => {
      return cell.id === self.id + '_' + id
    })
    if (aCells.length > 0) {
      return aCells[0]
    }
    return undefined
  }

  render () {
    let self = this
    this.domObj = $('<div>').addClass('row')
    this._processBindings(this.domObj)
    if ((this.settings) && (this.settings.rowStyle)) {
      this.domObj.attr('style', this.settings.rowStyle)
    }
    if (this.cssClazzName) {
      this.cssClazzName.split(' ').map(clazz => {
        this.domObj.addClass(clazz)
      })
    }
    this.cells.forEach(cell => {
      self.domObj.append(cell.render())
    })
    return this.domObj
  }
}

export class Grid extends UIElement {
  constructor (id, settings = {}) {
    if (arguments.length < 1) {
      throw new Error('invalid number of arguments')
    }
    super(id)
    this.rows = []
    this.settings = settings
    this.canvas = $('<div>')
    this.canvas.attr('id', this.id)
    this.formElements = {}
  }

  setElements (elements) {
    this.formElements = elements
  }

  getElementValue (id) {
    return this.formElements[id]
  }

  setFormChange (id, newValue) {
    this.formElements[id] = newValue
  }

  getElements () {
    return this.formElements
  }

  resetRows () {
    this.rows = []
    this.canvas.empty()
  }

  addRow (id, rowSettings) {
    if (rowSettings === undefined) {
      rowSettings = this.settings
    }
    if (id === undefined) { id = '' }
    let row = new GridRow(this.id + '_' + id, rowSettings)
    row.grid = this
    this.rows.push(row)
    return row
  }

  render () {
    let self = this
    this.rows.map(row => {
      self.canvas.append(row.render())
    })
    return this.canvas
  }
}

export class DatabaseGrid extends Grid {
  constructor (id, dataset, settings = {}) {
    super(id, settings)
    this.dataset = dataset
    this.curRecord = 0
    this.maxRecords = settings.maxRecords || 10
    this.pagination = new Pagination()
    this.pagination.maxPages = settings.maxPages || 8
    this.gridContainer = $('<div>')
    this.columnSort = -1
    this.sortReverse = false
  }

  setColumns (colums) {
    this.columns = colums
  }

  setBeforeQuery (beforeQuery) {
    this.beforeQuery = beforeQuery
  }

  setTitleLabels (titleLabels) {
    this.titleLabels = titleLabels
  }

  addSearchBar (label, clearButtonTitle, filterCallback) {
    let self = this
    this.searchInput = new ButtonInput(this.id + '_search', '', clearButtonTitle, (e, input) => {
      self.filter = input.value
      self.pagination.reset()
      self.renderPagination(0)
      self.updateBody()
    }, (e, btn) => {
      self.searchInput.setValue('')
      self.filter = ''
      self.pagination.reset()
      self.renderPagination(0)
      self.updateBody()
    })

    if (label) {
      this.searchInput.setGroupLabel(label)
    }
    this.filterCallback = filterCallback
  }

  resetSearch () {
    if (this.searchInput) {
      this.searchInput.setValue('')
      this.filter = ''
      this.pagination.reset()
      this.renderPagination(0)
      this.updateBody()
    }
  }

  getDataset () {
    let self = this
    if (this.beforeQuery) {
      this.beforeQuery()
    }
    // first try to ask the delegate for data
    if (this.dataset === undefined) {
      this.requestRefresh()
    }

    if (this.dataset === undefined) {
      return []
    }
    if ((this.filter !== undefined) && (this.filterCallback)) {
      return this.dataset.filter((element) => {
        return self.filterCallback(element, self.filter)
      })
    } else {
      return this.dataset
    }
  }

  getSortedDataset () {
    let self = this
    let ds = this.getDataset()
    if ((this.columnSort > -1) && (this.sortCallback)) {
      let sds = ds.sort((a, b) => {
        return self.sortCallback(this.columnSort, a, b)
      })
      return (self.sortReverse ? sds.reverse() : sds)
    }
    return ds
  }

  requestRefresh () {
    if (this.getDataset !== undefined) {
      // this.dataset = this.getDataset()
      if (this.beforeQuery) {
        this.beforeQuery()
      }
    }
  }

  setDataset (dataset, maxRecords = 10) {
    this.dataset = dataset
    this.curRecord = 0
    this.maxRecords = maxRecords
    this.updateBody()
  }

  setRenderer (callback) {
    this.renderder = callback
  }

  setMaxDataRecords (max) {
    this.maxRecords = max
  }

  prepare () {
    if (this.searchInput) {
      this.gridContainer.append(this.searchInput.render())
    }
    if (!this.footer) {
      this.footer = $('<div>')
      this.footer.attr('id', this.id + '_footer')
    }
    // only render the pagination once
    if (this.paginatioCanvas === undefined) {
      this.paginatioCanvas = $('<div>').addClass('row')
      this.paginatioCanvas.attr('style', 'margin-top:15px')
      this.footer.append(this.paginatioCanvas)
      // only add a pager if there are more records than maxRecords
      let divPc = $('<div>').addClass('col-auto')
      this.paginatioCanvas.append(divPc)
      this.pagination.setParent(divPc)
    }
    this.renderPagination(0)
    this.canvas.attr('style', 'margin:15px')
  }

  sortGridByColumn (col) {
    this.columnSort = col
    this.updateBody()
  }

  updateBody () {
    // loop thru the first Datasets
    let self = this
    this.resetRows()
    let dataset = this.getSortedDataset()
    let max = this.curRecord + this.maxRecords
    if (max > dataset.length) {
      max = dataset.length
    }
    var i = 0
    var j = 0
    // add the titleRow
    let row = super.addRow()
    row.setClasses('dbgridtitle')
    if (this.columns) {
      this.columns.map(column => {
        let col = row.addCell(column.sz, self.titleLabels[j] || '')
        // add a sortable label if column is sortabel
        if (column.sort !== undefined) {
          col.bind('click', (e) => {
            if (column.sort === self.columnSort) {
              self.sortReverse = !self.sortReverse
            } else {
              self.sortReverse = false
            }
            self.sortGridByColumn(column.sort)
          })
          col.addClass('clickable')
          if (column.sort === self.columnSort) {
            col.addClass(self.sortReverse ? 'sortbyreverse' : 'sortedby')
          }
        }
        j = j + 1
      })
    }
    for (let index = this.curRecord; index < max; index++) {
      const element = dataset[index]
      if (this.renderder) {
        let row = super.addRow(index)
        if (i % 2) {
          row.setClasses('dbgridline odd')
        } else {
          row.setClasses('dbgridline')
        }

        j = 0
        // create empty cells so we have access in the renderer
        this.columns.map(column => {
          row.addCell(column.sz, '', undefined, j)
          j = j + 1
        })
        if (element) {
          let renderedElements = this.renderder(row, element)
          j = 0
          // fill cells with content
          this.columns.map(column => {
            let cell = row.getCell(j)
            if ((cell) && (renderedElements[j])) {
              cell.setContent(renderedElements[j])
            }
            j = j + 1
          })
        }
        i = i + 1
      }
    }
    super.render()
    // make sure the table will not be taller than the first rendering so it will not snap on the last page
    let maxH = this.canvas.css('min-height')
    if (!maxH) {
      // this is a dirty trick
      setTimeout(() => {
        maxH = this.canvas.height() + 'px'
        self.canvas.css('min-height', maxH)
      }, 500)
    }
  }

  render () {
    this.prepare()
    this.updateBody()
    this.gridContainer.append(this.canvas)
    this.gridContainer.append(this.footer)
    return this.gridContainer
  }

  refresh () {
    this.pagination.reset()
    this.renderPagination(this.pagination.activePage)
    this.updateBody()
  }

  getCurrentPage () {
    return this.pagination.activePage
  }

  setCurrentPage (currentPage) {
    this.pagination.activePage = currentPage
  }

  renderPagination (activePage = 0) {
    var cnt = 0
    var tcnt = 1
    let self = this

    // remove all paginatios pages
    this.pagination.reset()
    if (this.getDataset().length > this.maxRecords) {
      // ((cnt >= start) && (cnt < start + count))
      while (cnt < this.getDataset().length) {
        this.pagination.addPage(tcnt - 1, false, tcnt, cnt, (e, page) => {
          self.curRecord = page.start
          self.updateBody()
          self.pagination.setActivePage(page.id)
        })
        cnt = cnt + this.maxRecords
        tcnt = tcnt + 1
      }
      this.pagination.setActivePage(activePage)
    } else {
      this.pagination.setActivePage(activePage)
    }
  }
}

export class ApiDatabaseGrid extends DatabaseGrid {
  setApiCall (apiCall) {
    this.apiCall = apiCall
  }

  execute (data) {
    let self = this
    this.apiCall.run(data).then((result) => {
      if (result) {
        self.setBeforeQuery(() => {
          self.dataset = result
        })

        self.prepare()
        self.updateBody()
      }
    })
  }
}

export class SelectInput extends Input {
  constructor (id, value, onChange) {
    super(id, value, onChange, '<select>')

    this.input.addClass('form-control')

    this.options = []
    this.size = 1
  }

  setValue (newValue) {
    this.value = newValue
    return this
  }

  setSize (size) {
    this.size = size
    if (this.input) {
      this.input.attr('size', this.size)
    }
    return this
  }

  setOptions (list) {
    this.options = list
    if (this.input) {
      this._internalFillOptionList()
    }
    return this
  }

  _internalFillOptionList () {
    let self = this
    this.input.empty()
    this.options.map(option => {
      let value = option
      let title = option
      if ((option.value) && (option.title)) {
        value = option.value
        title = option.title
      }
      let iOption = $('<option>').attr('value', value).html(title)
      if (value === self.value) {
        iOption.attr('selected', 'selected')
      }
      this.input.append(iOption)
    })
  }

  render () {
    super.render()
    this.input.attr('size', this.size)
    this._internalFillOptionList()
    if (this.label) {
      return this.container
    } else {
      return this.input
    }
  }
}

export class Card {
  constructor (id, title) {
    this.id = id
    this.title = title
    this.footer = ''
    this.content = ''
  }

  setTitle (title) {
    this.title = title
    if (this.oTitle) {
      this.oTitle.empty()
      this.oTitle.append(this.title)
    }
  }

  setContent (content) {
    this.content = content
    if (this.oBody) {
      this.oBody.empty()
      this.oBody.append(this.content)
    }
  }

  setFooter (footer) {
    this.footer = footer
    if (this.oFooter) {
      this.oFooter.empty()
      this.oFooter.append(this.footer)
    }
  }

  render () {
    let oCard = $('<div>').addClass('card')
    let oHeader = $('<div>').addClass('card-header')
    oCard.append(oHeader)
    this.oTitle = $('<h2>').attr('id', this.id + '_containerTitle')
    this.oTitle.append(this.title)
    oHeader.append(this.oTitle)

    this.oBody = $('<div>').addClass('card-body').attr('id', this.id + '_container')
    this.oBody.append(this.content)
    oCard.append(this.oBody)

    this.oFooter = $('<div>').addClass('card-footer').attr('id', this.id + '_containerFooter')
    this.oFooter.append(this.footer)
    oCard.append(this.oFooter)

    return oCard
  }
}

export class ButtonGroup extends UIElement {
  constructor (id, label) {
    super(id)
    this.buttons = []
    this.label = label || ''
  }

  /**
   * Adds a new Button to the group
   * @param {object} The new UI.Button Object
   * @returns {self}
   */

  addButton (button) {
    this.buttons.push(button)
    return this
  }

  render () {
    let gObject = $('<div>').attr('id', this.id).addClass('btn-group')
    gObject.attr('role', 'group').attr('aria-label', this.label)
    this.buttons.map(button => {
      gObject.append(button.render())
    })

    return gObject
  }
}

export class Canvas {
  constructor (id, idBcr) {
    this.canvas = $('<div>').attr('id', 'canvas_' + id)
    let p = $('#' + id)
    p.append(this.canvas)
    this.pages = []
    if (idBcr) {
      this.breadCrums = $('#' + idBcr)
    }
  }

  render () {
    let self = this

    this.canvas.empty()
    this.currentPage.content.appendTo(this.canvas)
    if (this.breadCrums) {
      this.breadCrums.empty()
      this.pages.map((page) => {
        let crum = $('<li>').addClass('breadcrumb-item').addClass('clickable').append(page.title)
        crum.bind('click', (e) => {
          self.goTo(page.name)
        })
        self.breadCrums.append(crum)
      })
    }
  }

  push (pageName, title) {
    if (this.currentPage) {
      this.currentPage.content.appendTo($('#tmpStorage'))
    }
    this.currentPage = { name: pageName, title: title, content: $('<div>') }
    this.pages.push(this.currentPage)
    this.render()
  }

  pop () {
    this.pages.pop()
    this.currentPage = this.pages[this.pages.length - 1]
    if (!this.currentPage) {
      this.push('root')
    }
    this.render()
  }

  goTo (toPage, title, emptyPage) {
    let found = false
    let i = 1
    let self = this
    this.pages.map((page) => {
      if (page.name === toPage) {
        self.pages = self.pages.slice(0, i)
        found = true
      } else {
        i = i + 1
      }
    })

    if (found) {
      this.currentPage = this.pages[this.pages.length - 1]
      if (emptyPage) {
        this.currentPage.content.empty()
      }
      this.render()
    } else {
      this.push(toPage, title)
    }
  }

  append (item) {
    this.currentPage.content.append(item)
  }
}

export class Navigation extends UIElement {
  constructor (id) {
    super(id)
    this.tabs = []
    this.canvas = $('<div>')
  }

  addTab (id, title, content, active) {
    this.tabs.push({id: id, title: title, active: active, content: content})
    return this
  }

  render () {
    let self = this
    this.canvas.empty()

    let oL = $('<ul>').addClass('nav').addClass('nav-pills').addClass('nav-fill').attr('role', 'tablist')
    let navCanvas = $('<div>').addClass('tab-content')
    this.canvas.append(oL)
    this.canvas.append(navCanvas)
    this.tabs.map((tab) => {
      let oLi = $('<li>').addClass('nav-item')
      oL.append(oLi)
      let oA = $('<a>').addClass('nav-link')
      oLi.append(oA)
      oA.attr('data-toggle', 'tab')
      oA.attr('href', '#' + self.id + '_tab_' + tab.id)
      oA.attr('role', 'tab')
      oA.attr('aria-controls', self.id + '_tab_' + tab.id)
      oA.addClass('clickable')
      let oT = $('<div>').addClass('tab-pane').addClass('fade').attr('role', 'tabpanel').attr('aria-labelledby', tab.id + '_tab')
      oT.attr('id', self.id + '_tab_' + tab.id)
      navCanvas.append(oT)
      if (tab.active === true) {
        oA.addClass('active')
        oA.attr('aria-selected', 'true')
        oT.addClass('active').addClass('show')
      }
      oT.append(tab.content)
      oA.append(tab.title)
    })
    return this.canvas
  }
}
