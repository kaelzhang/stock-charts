import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    resolve(),
    commonjs({
      include: ['node_modules/**']
    }),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}
