import GenericComponent from './GenericComponent'
import {line, scaleBand} from 'd3'
import boll from 'bollinger-bands'
import range from 'lodash.range'


const DEFAULT_OPTIONS = {
  periodSize: 20,
  times: 2
}

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
  }

  _transform (data) {
    const {
      periodSize,
      times
    } = this.options

    const b = boll(data.close, periodSize, times)
    const ret = []

    b.upper.forEach((upper, i) => {
      ret.push({
        upper: b.upper[i],
        middle: b.middle[i],
        lower: b.lower[i],
        i
      })
    })

    return ret
  }

  _range (datum, [min, max]) {
    return [Math.min(datum.lower, min), Math.max(datum.upper, min)]
  }

  _draw (selection, data) {
    const x = scaleBand()
    .domain(range(this._raw.length))
    .range([this._stage.x, this._stage.x + this._stage.width])
    .padding(0.1)

    this._path(selection, data, x, 'upper')
    this._path(selection, data, x, 'middle')
    this._path(selection, data, x, 'lower')
  }

  _path (selection, data, x, accessor) {
    const y = this._y
    const halfWidth = x.bandwidth() / 2

    const l = line()
    .x(d => x(d.i) + halfWidth)
    .y(d => y.y(d[accessor]))

    const d = l(data)

    selection.append('path')
    .classed(`boll ${accessor}`, true)
    .attr('d', d)
  }
}
