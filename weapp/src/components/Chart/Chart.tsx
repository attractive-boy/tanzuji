import { useEffect, useRef } from 'react';
import { Canvas, View, Text } from '@tarojs/components';

export default function ChartComponent({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    // 这里应该使用真正的图表库如ECharts
    // 暂时使用Canvas绘制简单的柱状图
    console.log('绘制图表数据:', data);
  };

  return (
    <View className="chart-container">
      <Canvas 
        className="chart-canvas"
        canvasId="carbonChart"
        ref={canvasRef}
      />
      <View className="chart-placeholder">
        <Text>📊 碳足迹趋势图表</Text>
        <Text className="chart-note">数据可视化展示区域</Text>
      </View>
    </View>
  );
}