// 网络状态监控服务
import Taro from '@tarojs/taro';

class NetworkMonitor {
  constructor() {
    this.isConnected = true;
    this.networkType = 'unknown';
    this.listeners = [];
    this.init();
  }

  init() {
    // 获取初始网络状态
    Taro.getNetworkType({
      success: (res) => {
        this.networkType = res.networkType;
        this.isConnected = res.networkType !== 'none';
        this.notifyListeners();
      }
    });

    // 监听网络状态变化
    Taro.onNetworkStatusChange((res) => {
      this.isConnected = res.isConnected;
      this.networkType = res.networkType;
      this.notifyListeners();
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        isConnected: this.isConnected,
        networkType: this.networkType
      });
    });
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      networkType: this.networkType
    };
  }
}

// 请求拦截器
class RequestInterceptor {
  static interceptors = [];

  static use(interceptor) {
    this.interceptors.push(interceptor);
  }

  static async run(config) {
    let result = config;
    for (const interceptor of this.interceptors) {
      result = await interceptor(result);
    }
    return result;
  }
}

// 响应拦截器
class ResponseInterceptor {
  static interceptors = [];

  static use(interceptor) {
    this.interceptors.push(interceptor);
  }

  static async run(response) {
    let result = response;
    for (const interceptor of this.interceptors) {
      result = await interceptor(result);
    }
    return result;
  }
}

// 离线同步服务
class SyncService {
  constructor(apiService, offlineService) {
    this.apiService = apiService;
    this.offlineService = offlineService;
    this.syncing = false;
    this.networkMonitor = new NetworkMonitor();
    
    // 监听网络恢复
    this.networkMonitor.addListener(this.handleNetworkChange.bind(this));
  }

  handleNetworkChange(status) {
    if (status.isConnected && !this.syncing) {
      this.syncOfflineData();
    }
  }

  async syncOfflineData() {
    if (this.syncing) return;
    
    this.syncing = true;
    const queue = this.offlineService.getQueue();
    
    for (const item of queue) {
      try {
        // 根据操作类型执行相应的API调用
        let result;
        switch (item.operation.type) {
          case 'ADD_ACTIVITY':
            result = await this.apiService.addActivity(item.operation.data);
            break;
          case 'UPDATE_ACTIVITY':
            result = await this.apiService.updateActivity(
              item.operation.id, 
              item.operation.data
            );
            break;
          case 'DELETE_ACTIVITY':
            result = await this.apiService.deleteActivity(item.operation.id);
            break;
        }
        
        // 同步成功，从队列中移除
        this.offlineService.removeFromQueue(item.id);
        
      } catch (error) {
        console.error('同步失败:', error);
        // 更新重试次数
        this.offlineService.updateRetryCount(item.id);
        
        // 如果重试次数过多，标记为失败
        if (item.retries >= 3) {
          this.markAsFailed(item.id);
        }
      }
    }
    
    this.syncing = false;
    this.offlineService.setLastSyncTime(Date.now());
  }

  markAsFailed(itemId) {
    const queue = this.offlineService.getQueue();
    const item = queue.find(i => i.id === itemId);
    if (item) {
      item.failed = true;
      this.offlineService.set(this.offlineService.OFFLINE_QUEUE_KEY, queue);
    }
  }

  getSyncStatus() {
    const queue = this.offlineService.getQueue();
    return {
      syncing: this.syncing,
      pendingCount: queue.length,
      failedCount: queue.filter(item => item.failed).length,
      lastSync: this.offlineService.getLastSyncTime()
    };
  }
}

// 错误处理服务
class ErrorHandler {
  static handlers = new Map();

  static register(code, handler) {
    this.handlers.set(code, handler);
  }

  static handle(error) {
    const code = error.code || error.statusCode;
    const handler = this.handlers.get(code);
    
    if (handler) {
      return handler(error);
    }
    
    // 默认错误处理
    console.error('未处理的错误:', error);
    Taro.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    });
  }
}

// 注册常见错误处理器
ErrorHandler.register(401, (error) => {
  // 认证失败，清除本地认证信息
  Taro.clearStorageSync();
  Taro.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  });
  Taro.redirectTo({ url: '/pages/login/login' });
});

ErrorHandler.register(403, (error) => {
  Taro.showToast({
    title: '权限不足',
    icon: 'none'
  });
});

ErrorHandler.register(500, (error) => {
  Taro.showToast({
    title: '服务器错误',
    icon: 'none'
  });
});

// 导出服务实例
const networkMonitor = new NetworkMonitor();
const syncService = new SyncService(/* 传入api和offline服务 */);

export {
  NetworkMonitor,
  RequestInterceptor,
  ResponseInterceptor,
  SyncService,
  ErrorHandler,
  networkMonitor,
  syncService
};

export default {
  NetworkMonitor,
  RequestInterceptor,
  ResponseInterceptor,
  SyncService,
  ErrorHandler,
  networkMonitor,
  syncService
};