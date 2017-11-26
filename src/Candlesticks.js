import GenericComponent, {symbol} from './GenericComponent'

const DEFAULT_OPTIONS = {}
const INDEX = symbol('index')

const getY = candle => candle.isBullish
  ? candle.close
  : candle.open

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
  }

  _transform (data) {
    data = data.slice()
    data.forEach((candle, i) => {
      candle[INDEX] = i
    })

    return data
  }

  _range (candle, [min, max]) {
    return [Math.min(candle.low, min), Math.max(candle.high, max)]
  }

  _draw (container, data) {
    const y = this._y
    const x = this._x
    const width = x.width()

    const candle = container
    .classed('candlesticks', true)
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .classed('candlestick', true)
    // c:
    // - high
    // - low
    // - close
    // - volume
    // - time
    .classed('bullish', c => c.isBullish)

    const body = candle.append('rect')
    .classed('body', true)
    .attr('x', c => x.x(c[INDEX]))
    .attr('y', c => y.y(getY(c)))
    .attr('height', c => y.height(c.body) || 1)
    .attr('width', width)

    candle
    .filter(c => c.upperShadow)
    .append('rect')
    .classed('shadow upper-shadow', true)
    .attr('x', c => x.point(c[INDEX]) - 0.5)
    .attr('y', c => y.y(c.high))
    .attr('height', c => y.height(c.upperShadow))
    .attr('width', 1)

    candle
    .filter(c => c.lowerShadow)
    .append('rect')
    .classed('shadow lower-shadow', true)
    .attr('x', c => x.point(c[INDEX]) - 0.5)
    .attr('y', c => y.y(c.low + c.lowerShadow))
    .attr('height', c => y.height(c.lowerShadow))
    .attr('width', 1)
  }
}
