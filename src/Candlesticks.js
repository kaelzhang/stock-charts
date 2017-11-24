import GenericComponent from './GenericComponent'
import {scaleBand} from 'd3'

const DEFAULT_OPTIONS = {
  bearishColor: 'green',
  bullishColor: 'red'
}

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

  // datum:
  // - high
  // - low
  // - close
  // - volume
  // - time
  _draw (container, data) {
    const {
      bullishColor,
      bearishColor
    } = this.options

    const x = scaleBand()
    .domain(data.map(data => data.time))
    .range([this._stage.x, this._stage.x + this._stage.width])
    .padding(0.1)

    const y = this._y
    const width = x.bandwidth()

    const candle = container
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')

    candle.append('rect')
    .classed('candle', true)
    .attr('x', c => x(c.time))
    .attr('y', c => y.y(getY(c)))
    .attr('height', c => y.height(c.body))
    .attr('width', width)
  }
}
