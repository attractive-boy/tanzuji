// 徽章展示页面
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../contexts/AuthContext';
import badgeManager from '../../services/badgeManager';
import BadgeCard from '../../components/BadgeCard/BadgeCard';
import './badges.scss';

export default function BadgesPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('badges');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 使用统一的徽章管理器获取数据
      const badgeStatus = await badgeManager.getUserBadgeStatus(user.id, []);
      
      setBadges(badgeStatus.badges);
      setAchievements(badgeStatus.achievements);
      setChallenges(badgeStatus.challenges);
    } catch (error) {
      console.error('加载徽章数据失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeClick = (badge) => {
    Taro.showModal({
      title: badge.name,
      content: badge.description,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleAchievementClick = (achievement) => {
    Taro.navigateTo({
      url: `/pages/achievement/detail?id=${achievement.id}`
    });
  };

  const startChallenge = async (challengeId) => {
    try {
      const result = await badgeManager.startChallenge(user.id, challengeId);
      if (result.success) {
        Taro.showToast({ title: '挑战开始!', icon: 'success' });
        loadData(); // 刷新数据
      } else {
        Taro.showToast({ title: result.error, icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '启动挑战失败', icon: 'none' });
    }
  };

  const renderBadgesTab = () => (
    <View className="badges-tab">
      {loading ? (
        <View className="loading-container">
          <Text>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY className="badges-scroll">
          <View className="badges-grid">
            {badges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="large"
                onClick={handleBadgeClick}
              />
            ))}
          </View>
          
          {badges.length === 0 && (
            <View className="empty-state">
              <Text className="empty-icon">🏆</Text>
              <Text className="empty-title">暂无徽章</Text>
              <Text className="empty-description">开始记录碳足迹来获得徽章吧!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderAchievementsTab = () => (
    <View className="achievements-tab">
      {loading ? (
        <View className="loading-container">
          <Text>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY className="achievements-scroll">
          <View className="achievements-list">
            {achievements.map(achievement => (
              <View 
                key={achievement.id}
                className="achievement-item"
                onClick={() => handleAchievementClick(achievement)}
              >
                <View className="achievement-header">
                  <Text className="achievement-emoji">{achievement.emoji}</Text>
                  <View className="achievement-info">
                    <Text className="achievement-title">{achievement.title}</Text>
                    <Text className="achievement-desc">{achievement.description}</Text>
                  </View>
                </View>
                
                <View className="achievement-progress">
                  <View className="progress-bar">
                    <View 
                      className="progress-fill"
                      style={{ width: `${achievement.progress.percentage}%` }}
                    />
                  </View>
                  <Text className="progress-text">
                    {achievement.progress.completed}/{achievement.progress.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderChallengesTab = () => (
    <View className="challenges-tab">
      {loading ? (
        <View className="loading-container">
          <Text>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY className="challenges-scroll">
          <View className="challenges-list">
            {badgeManager.getAllChallenges().map(challenge => {
              const isActive = challenges.some(c => c.challengeId === challenge.id && c.status === 'active');
              const isCompleted = challenges.some(c => c.challengeId === challenge.id && c.status === 'completed');
              
              return (
                <View key={challenge.id} className="challenge-card">
                  <View className="challenge-header">
                    <Text className="challenge-title">{challenge.title}</Text>
                    <Text className="challenge-duration">{challenge.duration}天挑战</Text>
                  </View>
                  
                  <Text className="challenge-description">{challenge.description}</Text>
                  
                  <View className="challenge-reward">
                    <Text className="reward-label">奖励:</Text>
                    <Text className="reward-value">徽章</Text>
                  </View>
                  
                  <View className="challenge-actions">
                    {isActive ? (
                      <Text className="status-active">进行中</Text>
                    ) : isCompleted ? (
                      <Text className="status-completed">已完成</Text>
                    ) : (
                      <View 
                        className="start-challenge-btn"
                        onClick={() => startChallenge(challenge.id)}
                      >
                        <Text>开始挑战</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );

  return (
    <View className="badges-page">
      {/* 顶部导航 */}
      <View className="page-header">
        <Text className="page-title">我的成就</Text>
      </View>

      {/* 标签页导航 */}
      <View className="tab-navigation">
        <View 
          className={`tab-item ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <Text>徽章</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Text>成就</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <Text>挑战</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View className="tab-content">
        {activeTab === 'badges' && renderBadgesTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'challenges' && renderChallengesTab()}
      </View>
    </View>
  );
}