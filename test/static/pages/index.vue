<template>
  <canvas ref="canvas" width="1000" height="300"></canvas>
</template>

<script>
import axios from 'axios'
import {
  Candlesticks,
  Playground
} from '../../../src'

export default {
  async mounted () {
    const canvas = this.$refs.canvas
    const context = canvas.getContext('2d')

    const url = 'http://api.ost.dev/stock/sz002239/candlesticks?span=DAY&from=2017-11-1'

    const {data} = await axios.get(url)

    new Playground(context)
    .stage(0, 0, 1000, 300)
    .add()
    
    const cs = new Candlesticks({
      candleDiameter: 20
    })
    cs.setData(data.filter(Boolean))
    cs.setStage(0, 0, 1000, 300)
    cs.draw(context)
  }
}
</script>

<style lang="css">
</style>
