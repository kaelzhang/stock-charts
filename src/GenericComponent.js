import setOptions from 'set-options'

export const symbol = key => Symbol.for(`stock-charts:${key}`)
export const DATA = symbol('data')
export const SET_SCALER = symbol('set-scaler')

// - `_method()` underscore methods are used for inner invocation
// - `[SYMBOL]()` Symbol methods are used for parent instance to invoke

export default class GenericComponent {
  constructor (options, DEFAULT_OPTIONS) {
    this.options = setOptions(options, DEFAULT_OPTIONS)
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

  _generateYScaler (iterator) {
    const [min, max] = iterator.reduce((prev, current) => {
      return this._range(current, prev)
    }, [Number.POSITIVE_INFINITY, 0])

    this._y = new YScaler(
      min, max, this._stage.height, this._stage.maxYScale)
  }

  draw (selection) {
    const data = this._transform(this._raw)
    this._generateYScaler(data)

    const container = selection
    .append('g')
    // .attr('x', this._stage.x)
    // .attr('y', this._stage.y)
    // .attr('width', this._stage.width)
    // .attr('height', this._stage.height)

    this._draw(container, data)
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
