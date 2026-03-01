module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: false,
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3
    }]
  ]
}