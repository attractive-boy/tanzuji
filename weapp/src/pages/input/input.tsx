import { useState } from 'react';
import { View, Text, Picker, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './input.scss';

const API_BASE_URL = 'http://localhost:3001';

export default function InputPage() {
  const [activityType, setActivityType] = useState('transport');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('km');
  const [loading, setLoading] = useState(false);

  const activityTypes = [
    { value: 'transport', label: '交通出行' },
    { value: 'electricity', label: '用电消耗' },
    { value: 'food', label: '饮食消费' },
    { value: 'purchase', label: '购物消费' }
  ];

  const units = {
    transport: ['km', 'mile'],
    electricity: ['kWh'],
    food: ['kg', '份'],
    purchase: ['元', '美元']
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Taro.showToast({ title: '请输入有效的数量', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const activityData = {
        user_id: 'user123', // 实际应用中应该从登录状态获取
        type: activityType,
        amount: parseFloat(amount),
        unit: unit,
        meta: getMetaForType(activityType)
      };

      const response = await Taro.request({
        url: `${API_BASE_URL}/ledger`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: activityData
      });

      if (response.statusCode === 200) {
        Taro.showToast({ title: '记录成功', icon: 'success' });
        setAmount('');
        // 返回上一页或刷新数据
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        throw new Error(response.data?.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      Taro.showToast({ 
        title: error.message || '记录失败', 
        icon: 'none' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetaForType = (type) => {
    const metaMap = {
      transport: { gco2PerKm: 150 }, // 示例因子
      electricity: { gco2PerKwh: 500 },
      food: { gco2PerKg: 2000 },
      purchase: { gco2PerCurrencyUnit: 100 }
    };
    return metaMap[type] || {};
  };

  // 快速添加预设
  const quickAddPresets = [
    { type: 'transport', amount: '10', unit: 'km', label: '通勤10公里' },
    { type: 'electricity', amount: '5', unit: 'kWh', label: '用电5度' },
    { type: 'food', amount: '1', unit: '份', label: '素食一餐' },
    { type: 'purchase', amount: '100', unit: '元', label: '日常购物100元' }
  ];

  const handleQuickAdd = (preset) => {
    setActivityType(preset.type);
    setAmount(preset.amount);
    setUnit(preset.unit);
  };

  return (
    <View className="input-container">
      <View className="input-header">
        <Text className="title">添加碳足迹记录</Text>
        <Text className="subtitle">记录日常生活中的碳排放</Text>
      </View>

      <View className="input-form">
        <View className="form-group">
          <Text className="label">活动类型</Text>
          <Picker
            mode="selector"
            range={activityTypes.map(item => item.label)}
            onChange={(e) => {
              const selectedIndex = parseInt(e.detail.value);
              setActivityType(activityTypes[selectedIndex].value);
              setUnit(units[activityTypes[selectedIndex].value][0]);
            }}
          >
            <View className="picker">
              {activityTypes.find(item => item.value === activityType)?.label || '请选择'}
            </View>
          </Picker>
        </View>

        <View className="form-row">
          <View className="form-group half">
            <Text className="label">数量</Text>
            <Input
              className="input"
              type="digit"
              placeholder={`请输入${unit}`}
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
            />
          </View>
          
          <View className="form-group half">
            <Text className="label">单位</Text>
            <Picker
              mode="selector"
              range={units[activityType]}
              onChange={(e) => {
                const selectedIndex = parseInt(e.detail.value);
                setUnit(units[activityType][selectedIndex]);
              }}
            >
              <View className="picker">
                {unit}
              </View>
            </Picker>
          </View>
        </View>

        <Button 
          className="submit-btn" 
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? '提交中...' : '添加记录'}
        </Button>
      </View>

      <View className="quick-add">
        <Text className="section-title">快速添加</Text>
        <View className="quick-buttons">
          {quickAddPresets.map((preset, index) => (
            <Button 
              key={index}
              className="quick-btn"
              onClick={() => handleQuickAdd(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </View>
      </View>
    </View>
  );
}