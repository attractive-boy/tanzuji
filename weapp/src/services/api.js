// API服务封装
class ApiService {
  static BASE_URL = 'http://localhost:3001';
  
  // 获取认证头
  static getAuthHeaders() {
    const token = Taro.getStorageSync('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // GET请求
  static async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${this.BASE_URL}${endpoint}?${queryString}` : `${this.BASE_URL}${endpoint}`;
      
      const response = await Taro.request({
        url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data;
      } else {
        throw new Error(response.data?.message || `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.error('GET请求失败:', error);
      throw error;
    }
  }

  // POST请求
  static async post(endpoint, data = {}) {
    try {
      const response = await Taro.request({
        url: `${this.BASE_URL}${endpoint}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        data
      });
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data;
      } else {
        throw new Error(response.data?.message || `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.error('POST请求失败:', error);
      throw error;
    }
  }

  // PUT请求
  static async put(endpoint, data = {}) {
    try {
      const response = await Taro.request({
        url: `${this.BASE_URL}${endpoint}`,
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        data
      });
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data;
      } else {
        throw new Error(response.data?.message || `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.error('PUT请求失败:', error);
      throw error;
    }
  }

  // DELETE请求
  static async delete(endpoint) {
    try {
      const response = await Taro.request({
        url: `${this.BASE_URL}${endpoint}`,
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data;
      } else {
        throw new Error(response.data?.message || `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.error('DELETE请求失败:', error);
      throw error;
    }
  }
}

// 业务API封装
export class CarbonApi {
  // 用户认证
  static async login(username, password) {
    return ApiService.post('/api/login', { username, password });
  }

  static async register(username, password) {
    return ApiService.post('/api/register', { username, password });
  }

  // 账本管理
  static async addActivity(activityData) {
    return ApiService.post('/ledger', activityData);
  }

  static async getActivities(limit = 50, offset = 0) {
    return ApiService.get('/ledger', { limit, offset });
  }

  static async getActivityById(id) {
    return ApiService.get(`/ledger/${id}`);
  }

  static async updateActivity(id, activityData) {
    return ApiService.put(`/ledger/${id}`, activityData);
  }

  static async deleteActivity(id) {
    return ApiService.delete(`/ledger/${id}`);
  }

  // 因子管理
  static async getFactors() {
    return ApiService.get('/factors');
  }

  static async getFactorById(id) {
    return ApiService.get(`/factors/${id}`);
  }

  // 徽章系统
  static async getUserBadges(userId) {
    return ApiService.get(`/badges/${userId}`);
  }

  static async getBadgeRules() {
    return ApiService.get('/badges/rules');
  }

  // 统计数据
  static async getStatistics(userId, period = 'week') {
    return ApiService.get(`/statistics/${userId}`, { period });
  }

  // 数据同步
  static async syncData(localData) {
    return ApiService.post('/sync', localData);
  }
}

export default ApiService;