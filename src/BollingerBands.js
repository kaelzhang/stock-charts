import GenericComponent from './GenericComponent'
import {line} from 'd3'
import boll from 'bollinger-bands'
import {mapClean} from './utils'


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

    return mapClean(b.upper, (upper, i) => {
      return {
        upper: b.upper[i],
        mid: b.mid[i],
        lower: b.lower[i],
        i
      }
    })
  }

  _range (datum, [min, max]) {
    return [Math.min(datum.lower, min), Math.max(datum.upper, max)]
  }

  _draw (selection, data) {
    this._path(selection, data, 'upper')
    this._path(selection, data, 'mid')
    this._path(selection, data, 'lower')
  }

  _path (selection, data, accessor) {
    const y = this._y
    const x = this._x

    const l = line()
    .x(d => x.point(d.i))
    .y(d => y.y(d[accessor]))

    const d = l(data)

    selection.append('path')
    .classed(`boll ${accessor}`, true)
    .attr('d', d)
  }
}
