// 本地存储服务
export class StorageService {
  static PREFIX = 'carbon_';

  // 设置存储项
  static set(key, value) {
    try {
      const storageKey = this.PREFIX + key;
      Taro.setStorageSync(storageKey, value);
      return true;
    } catch (error) {
      console.error('存储设置失败:', error);
      return false;
    }
  }

  // 获取存储项
  static get(key, defaultValue = null) {
    try {
      const storageKey = this.PREFIX + key;
      const value = Taro.getStorageSync(storageKey);
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error('存储获取失败:', error);
      return defaultValue;
    }
  }

  // 删除存储项
  static remove(key) {
    try {
      const storageKey = this.PREFIX + key;
      Taro.removeStorageSync(storageKey);
      return true;
    } catch (error) {
      console.error('存储删除失败:', error);
      return false;
    }
  }

  // 清空所有存储
  static clear() {
    try {
      Taro.clearStorageSync();
      return true;
    } catch (error) {
      console.error('清空存储失败:', error);
      return false;
    }
  }

  // 获取存储信息
  static getInfo() {
    try {
      return Taro.getStorageInfoSync();
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return null;
    }
  }
}

// 用户信息服务
export class UserService {
  static USER_KEY = 'user_info';
  static TOKEN_KEY = 'auth_token';
  static SETTINGS_KEY = 'user_settings';

  // 用户认证相关
  static setUserInfo(userInfo) {
    return StorageService.set(this.USER_KEY, userInfo);
  }

  static getUserInfo() {
    return StorageService.get(this.USER_KEY, {});
  }

  static setAuthToken(token) {
    return StorageService.set(this.TOKEN_KEY, token);
  }

  static getAuthToken() {
    return StorageService.get(this.TOKEN_KEY);
  }

  static clearAuth() {
    StorageService.remove(this.USER_KEY);
    StorageService.remove(this.TOKEN_KEY);
  }

  static isAuthenticated() {
    return !!this.getAuthToken();
  }

  // 用户设置相关
  static setUserSettings(settings) {
    const currentSettings = this.getUserSettings();
    const newSettings = { ...currentSettings, ...settings };
    return StorageService.set(this.SETTINGS_KEY, newSettings);
  }

  static getUserSettings() {
    return StorageService.get(this.SETTINGS_KEY, {
      unit: 'metric', // metric or imperial
      theme: 'light', // light or dark
      notifications: true,
      autoSync: true
    });
  }

  // 本地数据缓存
  static setCachedData(key, data, ttl = 3600000) { // 默认1小时过期
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    };
    return StorageService.set(`cache_${key}`, cacheData);
  }

  static getCachedData(key) {
    const cacheData = StorageService.get(`cache_${key}`);
    if (!cacheData) return null;
    
    // 检查是否过期
    if (Date.now() > cacheData.expires) {
      StorageService.remove(`cache_${key}`);
      return null;
    }
    
    return cacheData.data;
  }

  static clearCache() {
    const info = StorageService.getInfo();
    if (info && info.keys) {
      info.keys.forEach(key => {
        if (key.startsWith(`${StorageService.PREFIX}cache_`)) {
          StorageService.remove(key.replace(StorageService.PREFIX, ''));
        }
      });
    }
  }
}

// 离线数据服务
export class OfflineService {
  static OFFLINE_QUEUE_KEY = 'offline_queue';
  static LAST_SYNC_KEY = 'last_sync_time';

  // 添加到离线队列
  static addToQueue(operation) {
    const queue = this.getQueue();
    const newItem = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      operation: operation,
      retries: 0
    };
    queue.push(newItem);
    return StorageService.set(this.OFFLINE_QUEUE_KEY, queue);
  }

  // 获取离线队列
  static getQueue() {
    return StorageService.get(this.OFFLINE_QUEUE_KEY, []);
  }

  // 移除队列项
  static removeFromQueue(itemId) {
    const queue = this.getQueue();
    const newQueue = queue.filter(item => item.id !== itemId);
    return StorageService.set(this.OFFLINE_QUEUE_KEY, newQueue);
  }

  // 更新队列项重试次数
  static updateRetryCount(itemId) {
    const queue = this.getQueue();
    const item = queue.find(item => item.id === itemId);
    if (item) {
      item.retries += 1;
      item.lastAttempt = Date.now();
      return StorageService.set(this.OFFLINE_QUEUE_KEY, queue);
    }
    return false;
  }

  // 设置最后同步时间
  static setLastSyncTime(timestamp) {
    return StorageService.set(this.LAST_SYNC_KEY, timestamp);
  }

  // 获取最后同步时间
  static getLastSyncTime() {
    return StorageService.get(this.LAST_SYNC_KEY, 0);
  }

  // 清空队列
  static clearQueue() {
    return StorageService.remove(this.OFFLINE_QUEUE_KEY);
  }
}

export default {
  StorageService,
  UserService,
  OfflineService
};