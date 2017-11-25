<template>
  <!-- <canvas ref="canvas" width="1000" height="300"></canvas> -->
  <svg width="1000" height="300" ref="chart"></svg>
</template>

<script>
import axios from 'axios'
import {
  Candlesticks,
  BollingerBands,
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

    new Playground()
    .select(chart)
    .data(data.filter(Boolean))
    .stage(0, 0, 1000, 300)
    .add(new Candlesticks)
    .add(new BollingerBands)
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
.boll {
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.boll.upper {
  stroke: blue
}
.boll.middle {
  stroke: orange
}
.boll.lower {
  stroke: green
}
</style>
