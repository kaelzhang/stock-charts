import setOptions from 'set-options'
import {isCandlestick, Candlestick, Candlesticks} from 'candlesticks'

const DEFAULT_OPTIONS = {
  bearishColor: 'green',
  bullishColor: 'red',
  // TODO: naming
  gap: 2,
  lineWidth: 1,
  candleDiameter: 4
}
const DEFAULT_YSCALE = 500

class Stage {
  constructor (x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.array = [x, y, width, height]
  }
}

export default class {
  constructor (options) {
    this.options = setOptions(options, DEFAULT_OPTIONS)
    console.log(this.options)
  }

  setData (data: Array | Candlesticks) {
    this.data = Candlesticks.from(data)
  }

  setStage (x, y, width, height) {
    this.stage = new Stage(x, y, width, height)
  }

  clean (ctx) {
    ctx.clearRect(...this.stage.array)
  }

  _maxCandles () {
    const {
      gap,
      lineWidth,
      candleDiameter
    } = this.options

    return parseInt(this.stage.width / (gap + lineWidth * 2 + candleDiameter))
  }

  _dataYRange (amount) {
    let min = Number.POSITIVE_INFINITY
    let max = -1

    const minI = this.data.length - amount

    this.data.lastForEach(candle => {
      if (min > candle.low) {
        min = candle.low
      }

      if (max < candle.high) {
        max = candle.high
      }

    }, (nothing, i) => i <= minI)

    return [min, max]
  }

  // datum:
  // - high
  // - low
  // - close
  // - volume
  // - time
  draw (ctx) {
    const {
      bullishColor,
      bearishColor,
      lineWidth,
      candleDiameter,
      gap
    } = this.options

    // TODO: use hhv, llv to calculate yScale
    if (typeof this.options.yScale !== 'number') {
      this.options.yScale = DEFAULT_YSCALE
    }

    const halfLineWidth = lineWidth / 2
    const halfDiameter = candleDiameter / 2
    const delta = gap + candleDiameter + 2 * lineWidth
console.log(this.series, ctx)
    this.series.forEach((datum, i) => {
      const x = (i + 1) * delta

      const candle = isCandlestick(datum)
        ? datum
        : Candlestick.from(datum)

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
            x - halfDiameter,
            candle.close,
            candleDiameter,
            candle.body,
            false)

        // Draw a solid body for bearish candlestick
        : this._rect(ctx,
            x - halfDiameter,
            candle.open,
            candleDiameter,
            candle.body)
    })
  }

  _rect (ctx, x, y, width, height, fill = true) {
    const yScale = this.options.yScale
    console.log(x, y * yScale - 300, width, height * yScale)
    ctx[fill ? 'fillRect': 'strokeRect'](x, y * yScale - 1300, width, height * yScale)
  }
}
