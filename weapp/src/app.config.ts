export default {
  pages: [
    'pages/login/login',
    'pages/dashboard/dashboard',
    'pages/input/input',
    'pages/badges/badges'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTitleText: '碳足迹计算器',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#7A7E83',
    selectedColor: '#667eea',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/dashboard/dashboard',
        text: '首页'
      },
      {
        pagePath: 'pages/input/input',
        text: '添加'
      },
      {
        pagePath: 'pages/badges/badges',
        text: '成就'
      }
    ]
  }
}