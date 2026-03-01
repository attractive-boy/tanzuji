// 简单的Canvas图表组件（备用方案）
import { useEffect, useRef } from 'react';
import { Canvas, View, Text } from '@tarojs/components';

export default function SimpleChart({ data, type = 'bar', style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      drawChart();
    }
  }, [data, type]);

  const drawChart = () => {
    // 这里实现简单的Canvas绘图逻辑
    console.log(`绘制${type}图表:`, data);
    
    // 实际实现会使用Canvas API绘制图表
    // 由于篇幅限制，这里只做示意
  };

  return (
    <View className="simple-chart" style={style}>
      <Canvas 
        className="chart-canvas"
        canvasId="simpleChart"
        ref={canvasRef}
      />
      <View className="chart-info">
        <Text>📈 {type === 'bar' ? '柱状图' : '折线图'}</Text>
        <Text className="data-count">数据点: {data?.length || 0}</Text>
      </View>
    </View>
  );
}

// 进度环形图组件
export function ProgressRing({ percentage, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="progress-ring" style={{ width: `${size}px`, height: `${size}px` }}>
      <View 
        className="ring-background"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${size/2}px`,
          borderWidth: `${strokeWidth}px`
        }}
      />
      <View 
        className="ring-progress"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${size/2}px`,
          borderWidth: `${strokeWidth}px`,
          borderDasharray: circumference,
          borderDashoffset: strokeDashoffset
        }}
      />
      <View className="ring-text">
        <Text className="percentage">{percentage}%</Text>
        <Text className="label">完成度</Text>
      </View>
    </View>
  );
}