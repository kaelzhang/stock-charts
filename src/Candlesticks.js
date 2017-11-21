import setOptions from 'set-options'
import {isCandlestick, Candlestick, Candlesticks} from 'candlesticks'
import err from 'err-object'

const DEFAULT_OPTIONS = {
  bearishColor: 'green',
  bullishColor: 'red',
  // TODO: naming
  gap: 2,
  innerWidth: 1,
  candleDiameter: 4,
  maxYScale: 100
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

const justReturn = y => y

export default class {
  constructor (options) {
    this.options = setOptions(options, DEFAULT_OPTIONS)

    this._transformY = justReturn
    this._transformHeight = justReturn
    this._maxCandles = 0
    this._step = 0
    this._radius = 0
    this.stage = null
  }

  setData (data: Array | Candlesticks) {
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
      throw err({
        message: 'stage is not initialized',
        name: 'NoStageError',
        code: 'NO_STAGE'
      })
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
    const offset = this.data.length - this._maxCandles - i + 1
    this._getX = i => this._radius + this._step * offset
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

    const yScale = max === min
      ? 1
      : Math.min(this.options.maxYScale, height / (max - min))

    this._transformY = y => min + (y - min) * yScale
    this._transformHeight = height => height * yScale
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
      this._rect(ctx,
        x - halfLineWidth,
        candle.high,
        lineWidth,
        candle.upperShadow)

      // Lower shadow
      this._rect(ctx,
        x - halfLineWidth,
        bullish ? candle.open : candle.close,
        lineWidth,
        candle.lowerShadow)

      bullish
        // Draw a hollow body for bullish candlestick
        ? this._rect(ctx,
            x - this._outerRadius,
            candle.close,
            candleDiameter,
            candle.body,
            false)

        // Draw a solid body for bearish candlestick
        : this._rect(ctx,
            x - this._outerRadius,
            candle.open,
            candleDiameter,
            candle.body)
    })
  }

  _rect (ctx, x, y, width, height, fill = true) {
    y = this._transformY(y)
    height = this._transformHeight(height)

    if (fill) {
      ctx.fillRect(x, y, width, height)
      return
    }

    const {
      lineWidth
    } = this.options
    const halfLineWidth = lineWidth / 2

    ctx.strokeRect(
      x - halfLineWidth, y - halfLineWidth, width - lineWidth, height - lineWidth)
  }
}
