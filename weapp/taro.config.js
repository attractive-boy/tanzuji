module.exports = {
  projectName: "carbon-weapp",
  date: "2026-02-28",
  designWidth: 750,
  deviceRatio: {
    640: 2.34,
    750: 1,
    828: 1.81
  },
  sourceRoot: "src",
  outputRoot: "dist",
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: "react",
  mini: {
    devServer: {
      // 开发环境下禁用域名校验
      disableHostCheck: true
    }
  },
  h5: {}
};