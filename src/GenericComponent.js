import setOptions from 'set-options'
import {scaleBand} from 'd3'
import range from 'lodash.range'

export const symbol = key => Symbol.for(`stock-charts:${key}`)
export const DATA = symbol('data')
export const TRANSFORM_DATA = symbol('transform-data')
export const APPLY_YRANGE = symbol('apply-yrange')

// - `_method()` underscore methods are used for inner invocation
// - `[SYMBOL]()` Symbol methods are used for parent instance to invoke

export default class GenericComponent {
  constructor (options, DEFAULT_OPTIONS) {
    this.options = setOptions(options, DEFAULT_OPTIONS)
    this._raw = null
    this._data = null
    this._stage = null
    this._scaler = null
  }


  [DATA] (data) {
    this._raw = data
  }

  setStage (stage) {
    this._stage = stage
  }

  // Determine the min and max of the domain
  // The initial value is [0, Numnber.POSITIVE_INFINITY]
  // @Returns [min, max]
  _range (datum, [min, max]) {
    throw new Error('_range not implemented')
  }

  // Returns the iterator
  _transform (raw) {
    throw new Error('_range not implemented')
  }

  _draw (selection, data) {
    throw new Error('_range not implemented')
  }

  [TRANSFORM_DATA] () {
    this._data = this._transform(this._raw)
  }

  // TODO: apply ranges for all charts within the stage
  [APPLY_YRANGE] ([min, max]) {
    return this._data.reduce((prev, current) => {
      return this._range(current, prev)
    }, [min, max])
  }

  _generateXScaler () {
    const {
      x,
      width
    } = this._stage

    this._x = new XScaler(x, x + width, this._raw.length)
  }

  _generateYScaler () {
    const {
      range: [min, max],
      height,
      maxYScale
    } = this._stage

    this._y = new YScaler(min, max, height, maxYScale)
  }

  draw (selection) {
    this._generateXScaler()
    this._generateYScaler()

    const container = selection
    .append('g')
    // .attr('x', this._stage.x)
    // .attr('y', this._stage.y)
    // .attr('width', this._stage.width)
    // .attr('height', this._stage.height)

    this._draw(container, this._data)
  }
}

class XScaler {
  constructor (min, max, length, padding = 0.1) {
    this._x = scaleBand()
    .domain(range(length))
    .range([min, max])
    .padding(padding)

    this._width = this._x.bandwidth()
  }

  x (x) {
    return this._x(x)
  }

  width () {
    return this._width
  }

  point (x) {
    return this._x(x) + this._width / 2
  }
}

class YScaler {
  constructor (min, max, stageHeight, maxScale) {
    this._min = min
    this._max = max
    this._height = stageHeight

    const delta = max - min

    // The scale level for Y axis
    this._scale = delta === 0
      ? 1
      : Math.min(maxScale || Number.POSITIVE_INFINITY, stageHeight / delta)

    // Y: 0 -----------------------
    //          |               |
    //       offset             |
    //          |               |
    // max: --------------      |
    //                          |
    // y:   --------       stage height
    //                          |
    // min: --------------      |
    //          |               |
    //       offset             |
    //          |               |
    // ----------------------------
    this._offset = (stageHeight - this._scale * delta) / 2
  }

  y (y) {
    return (this._max - y) * this._scale + this._offset
  }

  height (height) {
    return height * this._scale
  }
}
