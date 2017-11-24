import GenericComponent from './GenericComponent'

import {isCandlestick, Candlestick, Candlesticks} from 'candlesticks'
// import err from 'err-object'

const DEFAULT_OPTIONS = {
  bearishColor: 'green',
  bullishColor: 'red',
  // TODO: naming
  gap: 2,
  lineWidth: 1,
  candleDiameter: 4
}

function NOOP () {}

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
    this._getX = NOOP
    this._transformY = null
    this._maxCandles = 0
    this._step = 0
    this._radius = 0
    this.stage = null
  }

  _iterator () {
    return this._data.slice(-1 * this._maxCandles)
  }

  _range (candle, [min, max]) {
    return [Math.min(candle.low, min), Math.max(candle.high, max)]
  }

  _checkStage () {
    if (!this.stage) {
      throw new Error('stage is not initialized')
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
