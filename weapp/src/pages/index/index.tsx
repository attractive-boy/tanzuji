import { View, Text } from '@tarojs/components';
import './index.scss';

export default function Index() {
  return React.createElement(
    View,
    { className: 'container' },
    React.createElement(Text, null, '欢迎使用碳足迹计算器小程序（占位页面）')
  );
}
