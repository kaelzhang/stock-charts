import GenericComponent from './GenericComponent'
import {line} from 'd3'
import {ma} from 'moving-averages'
import {mapClean} from './utils'


const DEFAULT_OPTIONS = {
  periodSize: 5
}

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
  }

  _transform (data) {
    const {
      periodSize
    } = this.options

    const m = ma(data.close, periodSize)
    return mapClean(m, (avg, i) => {
      return {avg, i}
    })
  }

  _range ({avg}, [min, max]) {
    return [Math.min(avg, min), Math.max(avg, max)]
  }

  _draw (selection, data) {
    selection.classed(`moving-average ma${this.options.periodSize}`, true)
    this._path(selection, data)
  }

  _path (selection, data) {
    const y = this._y
    const x = this._x

    const l = line()
    .x(d => x.point(d.i))
    .y(d => y.y(d.avg))

    const d = l(data)

    selection.append('path')
    .classed('band', true)
    .attr('d', d)
  }
}
