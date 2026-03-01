// 账本管理Hook
import { useState, useEffect, useCallback } from 'react';
import { CarbonApi } from '../services/api';
import { OfflineService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

export function useLedger() {
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0
  });

  // 加载账本数据
  const loadActivities = useCallback(async (limit = 50, offset = 0) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await CarbonApi.getActivities(limit, offset);
      setActivities(data);
      calculateStats(data);
    } catch (err) {
      console.error('加载账本数据失败:', err);
      setError(err.message);
      
      // 尝试从本地缓存获取数据
      const cached = OfflineService.getCachedData('activities');
      if (cached) {
        setActivities(cached);
        calculateStats(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 添加活动记录
  const addActivity = useCallback(async (activityData) => {
    setLoading(true);
    setError(null);
    
    try {
      // 添加用户ID
      const fullActivityData = {
        ...activityData,
        user_id: user?.id || 'guest'
      };
      
      const result = await CarbonApi.addActivity(fullActivityData);
      
      // 更新本地数据
      setActivities(prev => [result, ...prev]);
      calculateStats([result, ...activities]);
      
      // 缓存数据
      OfflineService.setCachedData('activities', [result, ...activities]);
      
      return { success: true, data: result };
    } catch (err) {
      console.error('添加活动失败:', err);
      setError(err.message);
      
      // 离线模式：添加到离线队列
      OfflineService.addToQueue({
        type: 'ADD_ACTIVITY',
        data: { ...activityData, user_id: user?.id || 'guest' }
      });
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, activities]);

  // 更新活动记录
  const updateActivity = useCallback(async (id, activityData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await CarbonApi.updateActivity(id, activityData);
      
      // 更新本地数据
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? result : activity
        )
      );
      
      calculateStats(activities);
      OfflineService.setCachedData('activities', activities);
      
      return { success: true, data: result };
    } catch (err) {
      console.error('更新活动失败:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [activities]);

  // 删除活动记录
  const deleteActivity = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await CarbonApi.deleteActivity(id);
      
      // 更新本地数据
      const newActivities = activities.filter(activity => activity.id !== id);
      setActivities(newActivities);
      calculateStats(newActivities);
      OfflineService.setCachedData('activities', newActivities);
      
      return { success: true };
    } catch (err) {
      console.error('删除活动失败:', err);
      setError(err.message);
      
      // 离线模式
      OfflineService.addToQueue({
        type: 'DELETE_ACTIVITY',
        id: id
      });
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [activities]);

  // 计算统计数据
  const calculateStats = useCallback((activityList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const total = activityList.reduce((sum, activity) => sum + (activity.kgco2e || 0), 0);
    const todayTotal = activityList
      .filter(a => new Date(a.created_at) >= today)
      .reduce((sum, activity) => sum + (activity.kgco2e || 0), 0);
    const weekTotal = activityList
      .filter(a => new Date(a.created_at) >= weekAgo)
      .reduce((sum, activity) => sum + (activity.kgco2e || 0), 0);
    const monthTotal = activityList
      .filter(a => new Date(a.created_at) >= monthAgo)
      .reduce((sum, activity) => sum + (activity.kgco2e || 0), 0);
    
    setStats({
      total: parseFloat(total.toFixed(2)),
      today: parseFloat(todayTotal.toFixed(2)),
      week: parseFloat(weekTotal.toFixed(2)),
      month: parseFloat(monthTotal.toFixed(2))
    });
  }, []);

  // 刷新数据
  const refresh = useCallback(() => {
    loadActivities();
  }, [loadActivities]);

  // 初始化加载
  useEffect(() => {
    if (isAuthenticated) {
      loadActivities();
    }
  }, [isAuthenticated, loadActivities]);

  return {
    activities,
    stats,
    loading,
    error,
    loadActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    refresh
  };
}

// 活动类型相关的Hook
export function useActivityTypes() {
  const [types, setTypes] = useState([
    { 
      id: 'transport', 
      name: '交通出行', 
      icon: '🚗',
      units: ['km', 'mile'],
      defaultUnit: 'km',
      color: '#FF6B6B'
    },
    { 
      id: 'electricity', 
      name: '用电消耗', 
      icon: '⚡',
      units: ['kWh'],
      defaultUnit: 'kWh',
      color: '#4ECDC4'
    },
    { 
      id: 'food', 
      name: '饮食消费', 
      icon: '🍎',
      units: ['kg', '份'],
      defaultUnit: '份',
      color: '#45B7D1'
    },
    { 
      id: 'purchase', 
      name: '购物消费', 
      icon: '🛍️',
      units: ['元', '美元'],
      defaultUnit: '元',
      color: '#96CEB4'
    }
  ]);

  const getTypeById = (id) => {
    return types.find(type => type.id === id);
  };

  const getDefaultFactor = (typeId) => {
    const factors = {
      transport: 150,    // gCO2e/km
      electricity: 500,  // gCO2e/kWh
      food: 2000,        // gCO2e/份
      purchase: 100      // gCO2e/元
    };
    return factors[typeId] || 0;
  };

  return {
    types,
    getTypeById,
    getDefaultFactor
  };
}