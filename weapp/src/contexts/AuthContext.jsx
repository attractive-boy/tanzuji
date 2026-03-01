// 用户认证上下文
import { createContext, useContext, useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { UserService } from '../services/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 应用启动时检查认证状态
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = UserService.getAuthToken();
      const userInfo = UserService.getUserInfo();
      
      if (token && userInfo && userInfo.id) {
        setUser(userInfo);
        setIsAuthenticated(true);
      } else {
        // 清除无效的认证信息
        UserService.clearAuth();
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      UserService.clearAuth();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      // 调用登录API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      
      // 保存认证信息
      UserService.setAuthToken(data.token);
      UserService.setUserInfo(data.user);
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('登录错误:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, email) => {
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        throw new Error('注册失败');
      }

      const data = await response.json();
      
      // 自动登录
      UserService.setAuthToken(data.token);
      UserService.setUserInfo(data.user);
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('注册错误:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 调用登出API
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UserService.getAuthToken()}`,
        },
      });
    } catch (error) {
      console.error('登出API调用失败:', error);
    } finally {
      // 清除本地认证信息
      UserService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      
      // 跳转到登录页
      Taro.redirectTo({ url: '/pages/login/login' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${UserService.getAuthToken()}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('更新资料失败');
      }

      const updatedUser = await response.json();
      
      // 更新本地用户信息
      UserService.setUserInfo(updatedUser);
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('更新资料错误:', error);
      return { success: false, error: error.message };
    }
  };

  const guestLogin = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      username: '游客用户',
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    
    UserService.setUserInfo(guestUser);
    setUser(guestUser);
    setIsAuthenticated(true);
    
    return { success: true, user: guestUser };
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    guestLogin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;