import { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './login.scss';

const API_BASE_URL = 'http://localhost:3001';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const token = Taro.getStorageSync('authToken');
    if (token) {
      // 已登录，跳转到主页
      Taro.switchTab({ url: '/pages/dashboard/dashboard' });
    }
  }, []);

  const handleAuth = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/register' : '/login';
      const response = await Taro.request({
        url: `${API_BASE_URL}${endpoint}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          username,
          password
        }
      });

      if (response.statusCode === 200) {
        // 保存认证信息
        Taro.setStorageSync('authToken', response.data.token);
        Taro.setStorageSync('userId', response.data.userId);
        
        Taro.showToast({ 
          title: isRegister ? '注册成功' : '登录成功', 
          icon: 'success' 
        });
        
        // 跳转到主页
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/dashboard/dashboard' });
        }, 1500);
      } else {
        throw new Error(response.data?.message || '操作失败');
      }
    } catch (error) {
      console.error('认证失败:', error);
      Taro.showToast({ 
        title: error.message || '操作失败', 
        icon: 'none' 
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setUsername('');
    setPassword('');
  };

  return (
    <View className="login-container">
      <View className="login-header">
        <Text className="title">碳足迹计算器</Text>
        <Text className="subtitle">记录生活，守护地球</Text>
      </View>
      
      <View className="login-form">
        <View className="input-group">
          <Text className="label">用户名</Text>
          <Input
            className="input"
            placeholder="请输入用户名"
            value={username}
            onInput={(e) => setUsername(e.detail.value)}
          />
        </View>
        
        <View className="input-group">
          <Text className="label">密码</Text>
          <Input
            className="input"
            placeholder="请输入密码"
            password
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>
        
        <Button 
          className="login-btn" 
          onClick={handleAuth}
          loading={loading}
          disabled={loading}
        >
          {loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
        </Button>
        
        <View className="toggle-mode" onClick={toggleMode}>
          <Text>
            {isRegister ? '已有账号？立即登录' : '还没有账号？立即注册'}
          </Text>
        </View>
      </View>

      {/* 游客模式 */}
      <View className="guest-mode">
        <Text className="guest-title">或</Text>
        <Button 
          className="guest-btn"
          onClick={() => {
            // 游客模式，使用临时用户ID
            Taro.setStorageSync('userId', 'guest_' + Date.now());
            Taro.switchTab({ url: '/pages/dashboard/dashboard' });
          }}
        >
          开始体验
        </Button>
      </View>
    </View>
  );
}