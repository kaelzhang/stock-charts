import setOptions from 'set-options'
import {isCandlestick, Candlestick} from 'candlesticks'

const DEFAULT_OPTIONS = {
  bearishColor: 'green',
  bullishColor: 'red',
  // TODO: naming
  gap: 2,
  lineWidth: 1,
  candleDiameter: 4
}

export default class {
  constructor (options) {
    this.options = setOptions(options, DEFAULT_OPTIONS)
  }

  setSeries (data) {
    this.series = data
  }

  // datum:
  // - high
  // - low
  // - close
  // - volume
  // - time
  draw (ctx, options) {
    const {
      bullishColor,
      bearishColor,
      lineWidth,
      candleDiameter,
      gap
    } = this.options
    const halfLineWidth = lineWidth / 2
    const halfDiameter = candleDiameter / 2
    const delta = gap + candleDiameter + 2 * lineWidth

    this.series.forEach((datum, i) => {
      const x = i * delta

      const candle = isCandlestick(datum)
        ? datum
        : new Candlestick(datum)

      const bullish = candle.isBullish
      ctx.strokeStyle = bullish
        ? options.bullishColor
        : options.bearishColor

      // Upper shadow
      ctx.fillRect(x - halfLineWidth, candle.high, lineWidth, this.upperShadow)
      // Lower shadow
      ctx.fillRect(
        x - halfLineWidth,
        bullish ? candle.open : candle.close,
        lineWidth,
        this.lowerShadow)

      bullish
        // Draw a hollow body for bullish candlestick
        ? ctx.strokeRect(x - halfDiameter,
            candle.close, candleDiameter, candle.body)
        // Draw a solid body for bearish candlestick
        : ctx.fillRect(x - halfDiameter,
            candle.open, candleDiameter, candle.body)

    })
  }
}
