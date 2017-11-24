import GenericComponent from './GenericComponent'
import {scaleBand} from 'd3'

const DEFAULT_OPTIONS = {}

function NOOP () {}

const getY = candle => candle.isBullish
  ? candle.close
  : candle.open

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
  }

  _transform (data) {
    return data.slice()
  }

  _range (candle, [min, max]) {
    return [Math.min(candle.low, min), Math.max(candle.high, max)]
  }

  _draw (container, data) {
    const x = scaleBand()
    .domain(data.map(data => data.time))
    .range([this._stage.x, this._stage.x + this._stage.width])
    .padding(0.1)

    const y = this._y
    const width = x.bandwidth()
    const halfWidth = width / 2

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
    .attr('x', c => x(c.time))
    .attr('y', c => y.y(getY(c)))
    .attr('height', c => y.height(c.body) || 1)
    .attr('width', width)

    candle
    .filter(c => c.upperShadow)
    .append('rect')
    .classed('shadow', true)
    .classed('upperShadow', true)
    .attr('x', c => x(c.time) + halfWidth - 0.5)
    .attr('y', c => y.y(c.high))
    .attr('height', c => y.height(c.upperShadow))
    .attr('width', 1)

    candle
    .filter(c => c.lowerShadow)
    .append('rect')
    .classed('shadow', true)
    .classed('lowerShadow', true)
    .attr('x', c => x(c.time) + halfWidth - 0.5)
    .attr('y', c => y.y(c.low + c.lowerShadow))
    .attr('height', c => y.height(c.lowerShadow))
    .attr('width', 1)
  }
}
