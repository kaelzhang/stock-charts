import GenericComponent from './GenericComponent'
import {line} from 'd3'
import boll from 'bollinger-bands'

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

    return boll(data.close, periodSize, times).map((datum, i) => {
      datum.i = i
      return datum
    })
  }

  _range (datum, [min, max]) {
    return [Math.min(datum.lower, min), Math.max(datum.upper, min)]
  }

  _draw (selection, data) {
    
  }
}
