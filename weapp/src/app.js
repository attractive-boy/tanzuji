import { Component } from 'react'
import './app.scss'

class App extends Component {
  componentDidMount() {
    console.log('碳足迹计算器小程序启动')
  }

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children
  }
}

export default App