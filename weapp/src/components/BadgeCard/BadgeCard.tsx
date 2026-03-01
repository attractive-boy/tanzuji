// 徽章卡片组件
import { View, Text, Image } from '@tarojs/components';
import './BadgeCard.scss';

export default function BadgeCard({ badge, size = 'medium', onClick }) {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'badge-small';
      case 'large': return 'badge-large';
      default: return 'badge-medium';
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#cccccc',
      rare: '#4a90e2',
      epic: '#9013fe',
      legendary: '#f5a623'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <View 
      className={`badge-card ${getSizeClass()} ${badge.earned ? 'earned' : 'locked'}`}
      onClick={() => onClick && onClick(badge)}
    >
      <View className="badge-icon">
        {badge.icon ? (
          <Image src={badge.icon} className="badge-image" />
        ) : (
          <Text className="badge-emoji">{badge.emoji || '🏆'}</Text>
        )}
        {!badge.earned && <View className="lock-overlay">🔒</View>}
      </View>
      
      <View className="badge-info">
        <Text className="badge-name">{badge.name}</Text>
        <Text className="badge-description">{badge.description}</Text>
        {badge.earned && badge.earnedDate && (
          <Text className="earned-date">
            获得于 {new Date(badge.earnedDate).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      <View 
        className="badge-rarity"
        style={{ backgroundColor: getRarityColor(badge.rarity) }}
      >
        <Text className="rarity-text">{badge.rarity.toUpperCase()}</Text>
      </View>
    </View>
  );
}

// 徽章展示网格
export function BadgeGrid({ badges, onBadgeClick, columns = 3 }) {
  return (
    <View className="badge-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {badges.map(badge => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          size="medium"
          onClick={onBadgeClick}
        />
      ))}
    </View>
  );
}

// 徽章进度条
export function BadgeProgress({ current, target, label }) {
  const percentage = Math.min(100, (current / target) * 100);
  
  return (
    <View className="badge-progress">
      <View className="progress-header">
        <Text className="progress-label">{label}</Text>
        <Text className="progress-text">{current}/{target}</Text>
      </View>
      <View className="progress-bar">
        <View 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </View>
      <Text className="progress-percentage">{Math.round(percentage)}%</Text>
    </View>
  );
}

// 成就徽章列表
export function AchievementList({ achievements, onAchievementClick }) {
  return (
    <View className="achievement-list">
      {achievements.map(achievement => (
        <View 
          key={achievement.id}
          className={`achievement-item ${achievement.completed ? 'completed' : 'pending'}`}
          onClick={() => onAchievementClick && onAchievementClick(achievement)}
        >
          <View className="achievement-icon">
            <Text>{achievement.emoji}</Text>
          </View>
          <View className="achievement-content">
            <Text className="achievement-title">{achievement.title}</Text>
            <Text className="achievement-description">{achievement.description}</Text>
            <View className="achievement-progress">
              <Text className="progress-text">
                {achievement.current || 0}/{achievement.target}
              </Text>
              <View className="mini-progress-bar">
                <View 
                  className="mini-progress-fill"
                  style={{ 
                    width: `${Math.min(100, ((achievement.current || 0) / achievement.target) * 100)}%` 
                  }}
                />
              </View>
            </View>
          </View>
          {achievement.completed && (
            <View className="completion-badge">✓</View>
          )}
        </View>
      ))}
    </View>
  );
}