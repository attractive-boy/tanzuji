import { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ChartComponent from '../../components/Chart/Chart';
import './dashboard.scss';

const API_BASE_URL = 'http://localhost:3001';

export default function Dashboard() {
  const [carbonData, setCarbonData] = useState({
    total: 0,
    weekly: [],
    activities: []
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 获取账本数据
      const ledgerResponse = await Taro.request({
        url: `${API_BASE_URL}/ledger`,
        method: 'GET'
      });
      
      if (ledgerResponse.statusCode === 200) {
        const activities = ledgerResponse.data;
        
        // 计算总碳足迹（使用本地计算作为降级方案）
        const total = activities.reduce((sum, activity) => {
          if (activity.kgco2e) {
            return sum + activity.kgco2e;
          } else {
            // 使用本地计算
            const localCalc = require('../../services/localCalculator').calculateCarbonFootprint(activity);
            return sum + localCalc;
          }
        }, 0);
        
        // 按周统计（简化处理）
        const weekly = [25, 30, 28, 42]; // 模拟数据
        
        setCarbonData({
          total: parseFloat(total.toFixed(1)),
          weekly,
          activities: activities.slice(0, 4) // 只显示最近4条记录
        });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      // 使用模拟数据作为降级方案
      setCarbonData({
        total: 125.5,
        weekly: [25, 30, 28, 42],
        activities: [
          { type: 'transport', amount: 150, unit: 'km', kgco2e: 22.5 },
          { type: 'electricity', amount: 120, unit: 'kWh', kgco2e: 60 },
          { type: 'food', amount: 30, unit: '餐', kgco2e: 30 },
          { type: 'purchase', amount: 500, unit: '元', kgco2e: 13 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCO2 = (kg) => {
    return kg.toFixed(1);
  };

  const getTypeIcon = (type) => {
    const icons = {
      transport: '🚗',
      electricity: '⚡',
      food: '🍎',
      purchase: '🛍️'
    };
    return icons[type] || '📊';
  };

  const getTypeLabel = (type) => {
    const labels = {
      transport: '交通出行',
      electricity: '用电消耗',
      food: '饮食消费',
      purchase: '购物消费'
    };
    return labels[type] || type;
  };

  return (
    <View className="dashboard-container">
      {/* 总览卡片 */}
      <View className="summary-card">
        <View className="total-co2">
          <Text className="amount">{formatCO2(carbonData.total)}</Text>
          <Text className="unit">kg CO₂e</Text>
        </View>
        <Text className="period">本周累计碳足迹</Text>
        <View className="comparison">
          <Text className="compare-text">较上周 ↑ 12%</Text>
        </View>
      </View>

      {/* 时间范围选择器 */}
      <View className="time-selector">
        {['day', 'week', 'month', 'year'].map(range => (
          <Button
            key={range}
            className={`time-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range === 'day' && '日'}
            {range === 'week' && '周'}
            {range === 'month' && '月'}
            {range === 'year' && '年'}
          </Button>
        ))}
      </View>

      {/* 图表区域 */}
      <View className="chart-section">
        <Text className="section-title">碳足迹趋势</Text>
        <ChartComponent data={carbonData.weekly} />
      </View>

      {/* 活动分类统计 */}
      <View className="activities-section">
        <Text className="section-title">活动分布</Text>
        <View className="activities-list">
          {carbonData.activities.map((activity, index) => (
            <View key={index} className="activity-item">
              <View className="activity-icon">
                {getTypeIcon(activity.type)}
              </View>
              <View className="activity-info">
                <Text className="activity-name">{getTypeLabel(activity.type)}</Text>
                <Text className="activity-desc">
                  {activity.amount}{activity.unit}
                </Text>
              </View>
              <View className="activity-co2">
                <Text className="co2-amount">{formatCO2(activity.kgco2e)}</Text>
                <Text className="co2-unit">kg</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 快捷操作 */}
      <View className="quick-actions">
        <Button 
          className="action-btn primary"
          onClick={() => {
            Taro.navigateTo({ url: '/pages/input/index' });
          }}
        >
          + 添加新记录
        </Button>
        <Button 
          className="action-btn secondary"
          onClick={loadData}
          loading={loading}
        >
          {loading ? '刷新中...' : '刷新数据'}
        </Button>
      </View>
    </View>
  );
}