// 用户设置Hook
import { useState, useEffect } from 'react';
import { UserService } from '../services/storage';

export function useSettings() {
  const [settings, setSettings] = useState({
    unit: 'metric',        // metric or imperial
    theme: 'light',        // light or dark
    notifications: true,
    autoSync: true,
    defaultView: 'dashboard',
    carbonUnit: 'kg',      // kg or ton
    precision: 2,          // 小数点位数
    language: 'zh-CN'      // 语言设置
  });

  useEffect(() => {
    // 从存储中加载设置
    const savedSettings = UserService.getUserSettings();
    setSettings(prev => ({ ...prev, ...savedSettings }));
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    UserService.setUserSettings(newSettings);
    
    // 特殊处理某些设置
    handleSpecialSettings(key, value);
  };

  const updateMultipleSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    UserService.setUserSettings(updatedSettings);
    
    // 处理特殊设置
    Object.keys(newSettings).forEach(key => {
      handleSpecialSettings(key, newSettings[key]);
    });
  };

  const handleSpecialSettings = (key, value) => {
    switch (key) {
      case 'theme':
        // 应用主题变化
        applyTheme(value);
        break;
      case 'language':
        // 应用语言变化
        applyLanguage(value);
        break;
      case 'notifications':
        // 处理通知权限
        handleNotificationPermission(value);
        break;
    }
  };

  const applyTheme = (theme) => {
    // 在实际应用中，这里会应用CSS主题
    console.log('应用主题:', theme);
    // document.documentElement.setAttribute('data-theme', theme);
  };

  const applyLanguage = (language) => {
    // 在实际应用中，这里会切换语言包
    console.log('切换语言:', language);
    // i18n.changeLanguage(language);
  };

  const handleNotificationPermission = async (enabled) => {
    if (enabled && typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        // 用户拒绝了通知权限
        updateSetting('notifications', false);
      }
    }
  };

  const getLocalizedUnit = (unitType) => {
    const unitMap = {
      metric: {
        distance: '公里',
        weight: '公斤',
        energy: '千瓦时'
      },
      imperial: {
        distance: '英里',
        weight: '磅',
        energy: '千瓦时'
      }
    };
    
    return unitMap[settings.unit]?.[unitType] || unitMap.metric[unitType];
  };

  const convertValue = (value, fromUnit, toUnit) => {
    // 单位转换逻辑
    const conversionRates = {
      'km->mile': 0.621371,
      'mile->km': 1.60934,
      'kg->lb': 2.20462,
      'lb->kg': 0.453592
    };
    
    const rate = conversionRates[`${fromUnit}->${toUnit}`];
    return rate ? value * rate : value;
  };

  const formatCarbonValue = (value) => {
    const unit = settings.carbonUnit;
    const precision = settings.precision;
    
    if (unit === 'ton' && value >= 1000) {
      return (value / 1000).toFixed(precision);
    }
    return value.toFixed(precision);
  };

  return {
    settings,
    updateSetting,
    updateMultipleSettings,
    getLocalizedUnit,
    convertValue,
    formatCarbonValue
  };
}

// 徽章系统Hook
export function useBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const loadBadges = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // 从API加载用户徽章
      const userBadges = await CarbonApi.getUserBadges(userId);
      setBadges(userBadges);
    } catch (error) {
      console.error('加载徽章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = (activities) => {
    // 检查成就条件
    const newAchievements = [];
    
    // 首次记录成就
    if (activities.length >= 1) {
      newAchievements.push({
        id: 'first_record',
        title: '第一步',
        description: '完成第一次碳足迹记录',
        emoji: '👣',
        completed: true
      });
    }
    
    // 一周记录成就
    const weekActivities = activities.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.created_at) >= weekAgo;
    });
    
    if (weekActivities.length >= 7) {
      newAchievements.push({
        id: 'weekly_champion',
        title: '周冠军',
        description: '一周内完成7次记录',
        emoji: '🏆',
        completed: true
      });
    }
    
    setAchievements(prev => [...prev, ...newAchievements]);
  };

  return {
    badges,
    achievements,
    loading,
    loadBadges,
    checkAchievements
  };
}