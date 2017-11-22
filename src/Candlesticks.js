import setOptions from 'set-options'
import {isCandlestick, Candlestick, Candlesticks} from 'candlesticks'
// import err from 'err-object'

const DEFAULT_OPTIONS = {
  bearishColor: 'green',
  bullishColor: 'red',
  // TODO: naming
  gap: 2,
  lineWidth: 1,
  candleDiameter: 4,
  maxYScale: 1000
}

class Stage {
  constructor (x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.array = [x, y, width, height]
  }
}

class YTransformer {
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

function NOOP () {}

export default class {
  constructor (options) {
    this.options = setOptions(options, DEFAULT_OPTIONS)

    this._getX = NOOP
    this._transformY = null
    this._maxCandles = 0
    this._step = 0
    this._radius = 0
    this.stage = null
  }

  setData (data) { //  Array | Candlesticks
    this.data = Candlesticks.from(data)
  }

  setStage (x, y, width, height) {
    this.stage = new Stage(x, y, width, height)
  }

  clean (ctx) {
    this._checkStage()
    ctx.clearRect(...this.stage.array)
  }

  _checkStage () {
    if (!this.stage) {
      throw new Error('stage is not initialized')
      // throw err({
      //   message: 'stage is not initialized',
      //   name: 'NoStageError',
      //   code: 'NO_STAGE'
      // })
    }
  }

  _calculateMaxCandles () {
    const {
      gap,
      lineWidth,
      candleDiameter
    } = this.options

    this._step = gap + candleDiameter
    this._radius = candleDiameter / 2
    this._maxCandles = parseInt(this.stage.width / this._step)
  }

  _generateGetX () {
    this._getX = i => {
      return this.stage.x + this.stage.width - this._radius - this._step * (
        this.data.length - 1 - i)
    }
  }

  _generateTransformY () {
    let min = Number.POSITIVE_INFINITY
    let max = -1

    this._iterate(candle => {
      if (min > candle.low) {
        min = candle.low
      }

      if (max < candle.high) {
        max = candle.high
      }
    })

    this._transformY = new YTransformer(
      min, max, this.stage.height, this.options.maxYScale)
  }

  _iterate (iteratee) {
    const minI = this.data.length - this._maxCandles
    this.data.lastForEach(iteratee, (nothing, i) => i <= minI)
  }

  // datum:
  // - high
  // - low
  // - close
  // - volume
  // - time
  draw (ctx) {
    this._checkStage()
    this._calculateMaxCandles()
    this._generateGetX()
    this._generateTransformY()

    const {
      bullishColor,
      bearishColor,
      candleDiameter,
      lineWidth
    } = this.options
    const halfLineWidth = lineWidth / 2
    const radius = candleDiameter / 2

    ctx.lineWidth = lineWidth

    this._iterate((candle, i) => {
      const x = this._getX(i)
      const bullish = candle.isBullish

      ctx.strokeStyle = ctx.fillStyle = bullish
        ? bullishColor
        : bearishColor

      // Upper shadow
      candle.upperShadow && this._rect(ctx,
        x - halfLineWidth,
        candle.high,
        lineWidth,
        candle.upperShadow)

      // Lower shadow
      candle.lowerShadow && this._rect(ctx,
        x - halfLineWidth,
        bullish ? candle.open : candle.close,
        lineWidth,
        candle.lowerShadow)

      bullish
        // Draw a hollow body for bullish candlestick
        ? this._rect(ctx,
            x - this._radius,
            candle.close,
            candleDiameter,
            candle.body,
            false)

        // Draw a solid body for bearish candlestick
        : this._rect(ctx,
            x - this._radius,
            candle.open,
            candleDiameter,
            candle.body)
    })
  }

  _rect (ctx, x, y, width, height, fill = true) {
    const {
      lineWidth
    } = this.options

    y = this._transformY.y(y)
    height = Math.max(lineWidth, this._transformY.height(height))

    if (fill) {
      ctx.fillRect(x, y, width, height)
      return
    }

    // The box model of canvas (stroke)rect:
    // - width: contains half line width
    // - half line width is outside width
    const halfLineWidth = lineWidth / 2

    ctx.strokeRect(
      x - halfLineWidth, y - halfLineWidth, width - lineWidth, height - lineWidth)
  }
}
