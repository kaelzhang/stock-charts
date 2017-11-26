import GenericComponent, {symbol} from './GenericComponent'

const DEFAULT_OPTIONS = {}
const INDEX = symbol('index')

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
  }

  _transform (data) {
    return data.slice().map((candle, i) => {
      candle[INDEX] = i
      return candle
    })
  }

  _range ({volume}, [min, max]) {
    return [0, Math.max(volume, max)]
  }

  _draw (selection, data) {
    selection.classed('volume', true)

    const y = this._y
    const x = this._x
    const width = x.width()

    selection.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .classed('bin', true)
    .classed('bullish', c => c.isBullish)
    .attr('x', c => x.x(c[INDEX]))
    .attr('y', c => y.y(c.volume))
    .attr('height', c => y.height(c.volume) || 1)
    .attr('width', width)
  }
}
