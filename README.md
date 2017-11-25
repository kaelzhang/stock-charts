[![Build Status](https://travis-ci.org/kaelzhang/stock-charts.svg?branch=master)](https://travis-ci.org/kaelzhang/stock-charts)
[![Coverage](https://codecov.io/gh/kaelzhang/stock-charts/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/stock-charts)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/stock-charts?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/stock-charts)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/stock-charts.svg)](http://badge.fury.io/js/stock-charts)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/stock-charts.svg)](https://www.npmjs.org/package/stock-charts)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/stock-charts.svg)](https://david-dm.org/kaelzhang/stock-charts)
-->

# stock-charts

SVG charts for fintech.

## Install

```sh
$ npm install stock-charts
```

## Usage

```html
<svg class="chart"></svg>
```

```js
import {
  Playground,
  Candlesticks,
  BollingerBands,
  MovingAverage,
  KDJ
} from 'stock-charts'

const playground = new Playground()
.select('.chart')
.data(data)

playground.stage(0, 0, 1000, 300)
.add(new Candlesticks)
.add(new BollingerBands)
.add(new MovingAverage({periodSize: 20}))
.draw()

playground.stage(0, 320, 1000, 200)
.add(new KDJ)
.draw()
```

## License

MIT
