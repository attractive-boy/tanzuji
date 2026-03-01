// 徽章服务主文件
import { badgeService, achievementTracker, challengeService } from './badgeSystem';

// 统一的徽章管理服务
class BadgeManager {
  constructor() {
    this.badgeService = badgeService;
    this.achievementTracker = achievementTracker;
    this.challengeService = challengeService;
  }

  // 获取用户的完整徽章状态
  async getUserBadgeStatus(userId, activities = []) {
    try {
      // 获取用户数据
      const userData = await this.getUserData(userId);
      
      // 评估可获得的徽章
      const earnedBadges = this.badgeService.evaluateBadges(userData, activities);
      
      // 获取成就进度
      const achievements = this.achievementTracker.getAchievements();
      
      // 获取活跃挑战
      const activeChallenges = this.challengeService.getUserActiveChallenges(userId);
      
      return {
        badges: earnedBadges,
        achievements,
        challenges: activeChallenges,
        stats: {
          totalBadges: earnedBadges.length,
          totalAchievements: achievements.length,
          activeChallenges: activeChallenges.length
        }
      };
    } catch (error) {
      console.error('获取徽章状态失败:', error);
      return {
        badges: [],
        achievements: [],
        challenges: [],
        stats: { totalBadges: 0, totalAchievements: 0, activeChallenges: 0 },
        error: error.message
      };
    }
  }

  // 更新成就进度
  async updateAchievement(userId, achievementId, stepId, progress) {
    try {
      const result = this.achievementTracker.updateAchievementProgress(
        userId, 
        achievementId, 
        stepId, 
        progress
      );
      
      // 如果成就完成，发放奖励
      if (result && result.isCompleted) {
        await this.awardAchievementReward(userId, result.achievement);
      }
      
      return result;
    } catch (error) {
      console.error('更新成就进度失败:', error);
      throw error;
    }
  }

  // 开始挑战
  async startChallenge(userId, challengeId) {
    try {
      const result = this.challengeService.startChallenge(userId, challengeId);
      
      if (result.success) {
        // 记录挑战开始事件
        await this.logEvent(userId, 'challenge_started', {
          challengeId,
          startDate: result.challenge.startDate
        });
      }
      
      return result;
    } catch (error) {
      console.error('开始挑战失败:', error);
      throw error;
    }
  }

  // 更新挑战进度
  async updateChallengeProgress(userId, challengeId, activities) {
    try {
      const result = this.challengeService.updateChallengeProgress(
        userId, 
        challengeId, 
        activities
      );
      
      if (result.success && result.progress.completed) {
        // 挑战完成时发放奖励
        await this.awardChallengeReward(userId, challengeId);
      }
      
      return result;
    } catch (error) {
      console.error('更新挑战进度失败:', error);
      throw error;
    }
  }

  // 发放成就奖励
  async awardAchievementReward(userId, achievement) {
    try {
      // 这里可以实现具体的奖励逻辑
      // 比如发放虚拟物品、积分等
      await this.logEvent(userId, 'achievement_completed', {
        achievementId: achievement.id,
        title: achievement.title
      });
      
      // 可以在这里调用其他服务发放奖励
      console.log(`用户 ${userId} 完成了成就: ${achievement.title}`);
    } catch (error) {
      console.error('发放成就奖励失败:', error);
    }
  }

  // 发放挑战奖励
  async awardChallengeReward(userId, challengeId) {
    try {
      const challenge = this.challengeService.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.reward) {
        await this.logEvent(userId, 'challenge_completed', {
          challengeId,
          reward: challenge.reward
        });
        
        console.log(`用户 ${userId} 完成了挑战: ${challenge.title}`);
      }
    } catch (error) {
      console.error('发放挑战奖励失败:', error);
    }
  }

  // 记录用户事件
  async logEvent(userId, eventType, data = {}) {
    try {
      // 这里应该连接到实际的日志服务或数据库
      const event = {
        userId,
        eventType,
        timestamp: new Date().toISOString(),
        data
      };
      
      console.log('记录事件:', event);
      // 实际实现中应该保存到数据库
      
      return event;
    } catch (error) {
      console.error('记录事件失败:', error);
      throw error;
    }
  }

  // 获取用户数据（模拟实现）
  async getUserData(userId) {
    // 实际实现中应该从数据库获取用户数据
    return {
      id: userId,
      sharesCount: 0,
      invitationsSent: 0,
      createdAt: new Date().toISOString()
    };
  }

  // 获取所有可用的徽章
  getAllBadges() {
    return this.badgeService.getAllBadges();
  }

  // 按稀有度获取徽章
  getBadgesByRarity(rarity) {
    return this.badgeService.getBadgesByRarity(rarity);
  }

  // 获取所有成就
  getAllAchievements() {
    return this.achievementTracker.getAchievements();
  }

  // 获取所有挑战
  getAllChallenges() {
    return this.challengeService.challenges;
  }
}

// 创建单例实例
const badgeManager = new BadgeManager();

export default badgeManager;
export { BadgeManager };