<template>
  <!-- <canvas ref="canvas" width="1000" height="300"></canvas> -->
  <svg width="1400" height="480" ref="chart"></svg>
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

const PREFIX = 'http://api.ost.dev/stock/sz002239/candlesticks?'

export default {
  async mounted () {
    const {
      span = 'DAY',
      from
    } = qs.parse(location.search.slice(1))

    const url = `${PREFIX}span=${span}&from=${from}`

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

    play.stage()

    play.stage(0, 330, 1400, 150)
    .add(new Volume)
    // .add(new KDJ)
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
