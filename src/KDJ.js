import GenericComponent from './GenericComponent'
import {line} from 'd3'
import kdj from 'kdj'
import {mapClean} from './utils'


const DEFAULT_OPTIONS = {
  periodSize: 9,
  kPeriodSize: 9,
  dPeriodSize: 9,
  kTimes: 3,
  dTimes: 2
}

export default class extends GenericComponent {
  constructor (options) {
    super(options, DEFAULT_OPTIONS)
  }

  _transform (data) {
    const {
      periodSize,
      kPeriodSize,
      dPeriodSize,
      kTimes,
      dTimes
    } = this.options

    const b = kdj(
      data.close,
      data.low,
      data.high,
      periodSize,
      kPeriodSize,
      dPeriodSize,
      kTimes,
      dTimes)

    return mapClean(b.K, (upper, i) => {
      return {
        K: b.K[i],
        D: b.D[i],
        J: b.J[i],
        i
      }
    })
  }

  _range ({K, D, J}, [min, max]) {
    return [Math.min(min, K, D, J), Math.max(max, K, D, J)]
  }

  _draw (selection, data) {
    this._path(selection, data, 'K')
    this._path(selection, data, 'D')
    this._path(selection, data, 'J')
  }

  _path (selection, data, accessor) {
    const y = this._y
    const x = this._x

    const l = line()
    .x(d => x.point(d.i))
    .y(d => y.y(d[accessor]))

    const d = l(data)

    selection.append('path')
    .classed(`kdj ${accessor.toLowerCase()}`, true)
    .attr('d', d)
  }
}
