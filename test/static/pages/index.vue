<template>
  <!-- <canvas ref="canvas" width="1000" height="300"></canvas> -->
  <svg width="1400" height="660" ref="chart"></svg>
</template>

<script>
import axios from 'axios'
import {
  Candlesticks,
  BollingerBands,
  MovingAverage,
  KDJ,
  Volume,
  Playground
} from '../../../src'
import qs from 'query-string'

const _toSuffix = to => to ? `&to=${to}` : ''
const getRemoteUrl = (code = 'sz002239', span = 'DAY', from = '2017-01-01', to) =>
  `http://api.ost.dev/stock/${code}/candlesticks?span=${span}&from=${from}${_to_toSuffix(to)}`

export default {
  async mounted () {
    const {
      span,
      from,
      to,
      code
    } = qs.parse(location.search.slice(1))

    const url = getRemoteUrl(code, span, from, to)
    const {data} = await axios.get(url)

    const chart = this.$refs.chart

    const play = new Playground()
    .select(chart)
    .data(data.filter(Boolean))

    play.stage(0, 0, 1400, 300)
    .add(new Candlesticks)
    .add(new BollingerBands)
    .add(new MovingAverage)
    .add(new MovingAverage({
      periodSize: 10
    }))
    .add(new MovingAverage({
      periodSize: 20
    }))
    .draw()

    play.stage(0, 320, 1400, 150)
    .add(new Volume)
    .draw()

    play.stage(0, 510, 1400, 150)
    .add(new KDJ)
    .draw()
  }
}
</script>

<style lang="css">
.candlestick .body{
  fill: green
}
.bullish .body{
  fill: transparent;
  stroke: red;
  stroke-width: 1
}
.candlestick .shadow {
  fill: green
}
.bullish .shadow {
  fill: red
}
.band {
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.band:hover {
  stroke-width: 2
}
.band.upper {
  stroke: blue
}
.band.middle {
  stroke: orange
}
.band.lower {
  stroke: green
}
.ma5, .k {
  stroke: blue
}
.ma10, .d {
  stroke: orange
}
.ma20, .j {
  stroke: magenta
}
.volume .bin {
  fill: green
}
.volume .bullish {
  fill: red
}
</style>
