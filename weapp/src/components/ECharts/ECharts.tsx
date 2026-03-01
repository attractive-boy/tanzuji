// ECharts图表组件
import { useEffect, useRef } from 'react';
import { Canvas, View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

export default function EChartsComponent({ option, style = {}, onChartInit }) {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    initChart();
    return () => {
      // 清理图表实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current && option) {
      chartInstance.current.setOption(option, true);
    }
  }, [option]);

  const initChart = () => {
    // 在实际项目中，这里应该引入真正的ECharts库
    // 由于小程序环境限制，暂时使用模拟实现
    
    console.log('初始化图表:', option);
    
    // 模拟图表初始化
    chartInstance.current = {
      setOption: (newOption) => {
        console.log('更新图表配置:', newOption);
      },
      dispose: () => {
        console.log('销毁图表实例');
      }
    };
    
    if (onChartInit) {
      onChartInit(chartInstance.current);
    }
  };

  return (
    <View className="echarts-container" style={style}>
      <Canvas 
        className="echarts-canvas"
        canvasId="echartsCanvas"
        ref={canvasRef}
      />
      <View className="echarts-placeholder">
        <Text>📊 数据可视化图表</Text>
        <Text className="placeholder-note">此处将显示ECharts图表</Text>
      </View>
    </View>
  );
}

// 碳足迹趋势图表配置
export function CarbonTrendChart({ data, period = 'week' }) {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} kg CO₂e'
    },
    xAxis: {
      type: 'category',
      data: getPeriodLabels(period, data.length)
    },
    yAxis: {
      type: 'value',
      name: 'kg CO₂e'
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(102, 126, 234, 0.3)'
          }, {
            offset: 1, color: 'rgba(102, 126, 234, 0.05)'
          }]
        }
      },
      lineStyle: {
        color: '#667eea',
        width: 3
      },
      itemStyle: {
        color: '#667eea',
        borderWidth: 2,
        borderColor: '#fff'
      }
    }],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%'
    }
  };

  return (
    <EChartsComponent 
      option={option}
      style={{ height: '200px' }}
    />
  );
}

// 活动分布饼图
export function ActivityDistributionChart({ activities }) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} kg ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: activities.map(activity => ({
        name: getActivityLabel(activity.type),
        value: activity.kgco2e
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <EChartsComponent 
      option={option}
      style={{ height: '200px' }}
    />
  );
}

// 碳足迹对比柱状图
export function CarbonComparisonChart({ currentData, previousData, labels }) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['本期', '上期']
    },
    xAxis: {
      type: 'category',
      data: labels
    },
    yAxis: {
      type: 'value',
      name: 'kg CO₂e'
    },
    series: [
      {
        name: '本期',
        type: 'bar',
        data: currentData,
        itemStyle: {
          color: '#667eea'
        }
      },
      {
        name: '上期',
        type: 'bar',
        data: previousData,
        itemStyle: {
          color: '#764ba2'
        }
      }
    ]
  };

  return (
    <EChartsComponent 
      option={option}
      style={{ height: '200px' }}
    />
  );
}

// 辅助函数
function getPeriodLabels(period, count) {
  const now = new Date();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    switch (period) {
      case 'day':
        date.setDate(date.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        break;
      case 'week':
        date.setDate(date.getDate() - i * 7);
        labels.push(`第${Math.ceil((count - i) / 7)}周`);
        break;
      case 'month':
        date.setMonth(date.getMonth() - i);
        labels.push(`${date.getFullYear()}.${date.getMonth() + 1}`);
        break;
      default:
        labels.push(`周期${count - i}`);
    }
  }
  
  return labels;
}

function getActivityLabel(type) {
  const labels = {
    transport: '交通出行',
    electricity: '用电消耗',
    food: '饮食消费',
    purchase: '购物消费'
  };
  return labels[type] || type;
}