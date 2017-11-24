import {DATA, symbol} from './GenericComponent'
import {Candlesticks} from 'candlesticks'
import {select} from 'd3'

const createStageKey = (x, y, width, height) =>
  Symbol.for(`${x}:${y}:${width}:${height}`)

class GenericManager {
  constructor (container) {
    this._children = []
  }

  // @param {function()} matcher
  _addChild (matcher, factory) {
    const index = this._children.findIndex(matcher)
    if (~index) {
      return this._children[index]
    }

    const child = factory()
    this._children.push(child)
    return child
  }

  _runChildCommand (name, args = []) {
    this._children.forEach(child => {
      child[name](...args)
    })
  }

  draw () {
    this._runChildCommand('draw', [this._container])
  }

  [DATA] (data) {
    this._data = data
    this._runChildCommand(DATA, [data])
  }
}

export default class Playground extends GenericManager {
  // constructor (container) {
  //   super(select(container))
  // }

  // Set data source
  data (data) {
    this[DATA](Candlesticks.from(data))
    return this
  }

  select (container) {
    this._container = select(container)
    return this
  }

  // Set
  stage (x, y, width, height, options) {
    const key = createStageKey(x, y, width, height)

    return this._addChild(child => child._key === key, () => {
      const stage = new Stage(this._container, this, key, x, y, width, height, options)

      if (this._data) {
        stage[DATA](this._data)
      }

      return stage
    })
  }
}

class Stage extends GenericManager {
  constructor (container, playground, key, x, y, width, height, {
    maxYScale = 1000
  } = {}) {
    super()
    this._container = container
    this._playground = playground
    this._key = key
    this._data = null

    this._size = new StageSize(x, y, width, height, maxYScale)
  }

  leave () {
    return this._playground
  }

  // TODO
  clear () {

  }

  draw () {
    this._runChildCommand('draw', [this._container])
  }

  add (chart) {
    this._addChild(child => child === chart, () => {
      if (this._data) {
        chart[DATA](this._data)
      }

      chart.setStage(this._size)
      return chart
    })

    return this
  }
}

class StageSize {
  constructor (x, y, width, height, maxYScale) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.maxYScale = maxYScale
    this.array = [x, y, width, height]
  }
}
