// 徽章系统服务
class BadgeService {
  constructor() {
    this.badgeRules = this.initializeBadgeRules();
  }

  initializeBadgeRules() {
    return [
      // 新手徽章
      {
        id: 'first_record',
        name: '第一步',
        description: '完成第一次碳足迹记录',
        emoji: '👣',
        rarity: 'common',
        condition: {
          type: 'activity_count',
          target: 1
        }
      },
      {
        id: 'five_records',
        name: '环保新手',
        description: '完成5次碳足迹记录',
        emoji: '🌱',
        rarity: 'common',
        condition: {
          type: 'activity_count',
          target: 5
        }
      },
      {
        id: 'ten_records',
        name: '环保达人',
        description: '完成10次碳足迹记录',
        emoji: '🌿',
        rarity: 'rare',
        condition: {
          type: 'activity_count',
          target: 10
        }
      },
      
      // 低碳生活徽章
      {
        id: 'low_carbon_week',
        name: '低碳先锋',
        description: '一周内碳足迹低于平均水平50%',
        emoji: '🍃',
        rarity: 'rare',
        condition: {
          type: 'weekly_average',
          target: 50, // 百分比
          comparison: 'below'
        }
      },
      {
        id: 'zero_transport',
        name: '绿色出行',
        description: '连续3天无交通碳排放',
        emoji: '🚲',
        rarity: 'epic',
        condition: {
          type: 'consecutive_days_no_transport',
          target: 3
        }
      },
      
      // 挑战徽章
      {
        id: 'vegan_challenge',
        name: '素食主义者',
        description: '连续7天记录素食消费',
        emoji: '🥗',
        rarity: 'epic',
        condition: {
          type: 'consecutive_vegan_days',
          target: 7
        }
      },
      {
        id: 'energy_saver',
        name: '节能专家',
        description: '月度用电量低于平均水平30%',
        emoji: '💡',
        rarity: 'legendary',
        condition: {
          type: 'monthly_electricity_reduction',
          target: 30
        }
      },
      
      // 社交徽章
      {
        id: 'social_sharer',
        name: '环保传播者',
        description: '分享碳足迹报告5次',
        emoji: '📢',
        rarity: 'common',
        condition: {
          type: 'shares_count',
          target: 5
        }
      },
      {
        id: 'community_leader',
        name: '社区领袖',
        description: '邀请3位朋友加入',
        emoji: '👥',
        rarity: 'rare',
        condition: {
          type: 'invitations_sent',
          target: 3
        }
      }
    ];
  }

  evaluateBadges(userData, activities) {
    const earnedBadges = [];
    const currentDate = new Date();
    
    this.badgeRules.forEach(rule => {
      if (this.checkBadgeCondition(rule, userData, activities, currentDate)) {
        earnedBadges.push({
          ...rule,
          earned: true,
          earnedDate: currentDate.toISOString(),
          userId: userData.id
        });
      }
    });
    
    return earnedBadges;
  }

  checkBadgeCondition(rule, userData, activities, currentDate) {
    switch (rule.condition.type) {
      case 'activity_count':
        return activities.length >= rule.condition.target;
      
      case 'weekly_average':
        return this.checkWeeklyAverage(activities, rule.condition.target, rule.condition.comparison);
      
      case 'consecutive_days_no_transport':
        return this.checkConsecutiveDaysNoTransport(activities, rule.condition.target);
      
      case 'consecutive_vegan_days':
        return this.checkConsecutiveVeganDays(activities, rule.condition.target);
      
      case 'monthly_electricity_reduction':
        return this.checkMonthlyElectricityReduction(activities, rule.condition.target);
      
      case 'shares_count':
        return userData.sharesCount >= rule.condition.target;
      
      case 'invitations_sent':
        return userData.invitationsSent >= rule.condition.target;
      
      default:
        return false;
    }
  }

  checkWeeklyAverage(activities, targetPercentage, comparison) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentActivities = activities.filter(a => new Date(a.created_at) >= weekAgo);
    const weeklyTotal = recentActivities.reduce((sum, a) => sum + (a.kgco2e || 0), 0);
    
    // 这里应该与用户的历史平均值比较
    const historicalAverage = this.calculateHistoricalAverage(activities);
    const percentage = (weeklyTotal / historicalAverage) * 100;
    
    if (comparison === 'below') {
      return percentage <= targetPercentage;
    }
    return percentage >= targetPercentage;
  }

  checkConsecutiveDaysNoTransport(activities, targetDays) {
    const transportActivities = activities.filter(a => a.type === 'transport');
    const sortedDates = [...new Set(
      transportActivities.map(a => new Date(a.created_at).toDateString())
    )].sort();
    
    let consecutiveDays = 0;
    let maxConsecutive = 0;
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      const diffDays = (next - current) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        consecutiveDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
      } else {
        consecutiveDays = 0;
      }
    }
    
    return maxConsecutive >= targetDays;
  }

  checkConsecutiveVeganDays(activities, targetDays) {
    const foodActivities = activities.filter(a => a.type === 'food');
    // 这里需要根据食物类型判断是否为素食
    // 简化处理：假设含有特定关键词的食物为素食
    const veganActivities = foodActivities.filter(a => 
      a.description && (a.description.includes('素食') || a.description.includes('蔬菜'))
    );
    
    return veganActivities.length >= targetDays;
  }

  checkMonthlyElectricityReduction(activities, targetPercentage) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const recentElectricity = activities
      .filter(a => a.type === 'electricity' && new Date(a.created_at) >= monthAgo)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    const previousElectricity = activities
      .filter(a => a.type === 'electricity' && new Date(a.created_at) < monthAgo)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    if (previousElectricity === 0) return false;
    
    const reductionPercentage = ((previousElectricity - recentElectricity) / previousElectricity) * 100;
    return reductionPercentage >= targetPercentage;
  }

  calculateHistoricalAverage(activities) {
    if (activities.length === 0) return 100; // 默认值
    
    const total = activities.reduce((sum, a) => sum + (a.kgco2e || 0), 0);
    return total / activities.length;
  }

  getBadgeById(id) {
    return this.badgeRules.find(badge => badge.id === id);
  }

  getAllBadges() {
    return this.badgeRules;
  }

  getBadgesByRarity(rarity) {
    return this.badgeRules.filter(badge => badge.rarity === rarity);
  }
}

// 成就追踪服务
class AchievementTracker {
  constructor() {
    this.achievements = this.initializeAchievements();
  }

  initializeAchievements() {
    return [
      {
        id: 'carbon_footprint_awareness',
        title: '碳足迹意识觉醒',
        description: '了解什么是碳足迹',
        emoji: '🧠',
        steps: [
          { id: 'read_about_carbon', title: '阅读碳足迹介绍', completed: false },
          { id: 'calculate_first', title: '计算第一次碳足迹', completed: false },
          { id: 'set_goal', title: '设定减排目标', completed: false }
        ]
      },
      {
        id: 'daily_tracking',
        title: '日常追踪大师',
        description: '连续记录碳足迹30天',
        emoji: '📅',
        steps: [
          { id: 'track_7_days', title: '连续记录7天', target: 7, current: 0 },
          { id: 'track_15_days', title: '连续记录15天', target: 15, current: 0 },
          { id: 'track_30_days', title: '连续记录30天', target: 30, current: 0 }
        ]
      },
      {
        id: 'transport_reduction',
        title: '绿色出行倡导者',
        description: '减少交通碳排放50%',
        emoji: '🚆',
        steps: [
          { id: 'analyze_transport', title: '分析交通碳排放', completed: false },
          { id: 'reduce_by_25', title: '减少25%交通排放', target: 25, current: 0 },
          { id: 'reduce_by_50', title: '减少50%交通排放', target: 50, current: 0 }
        ]
      }
    ];
  }

  updateAchievementProgress(userId, achievementId, stepId, progress) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return null;

    const step = achievement.steps.find(s => s.id === stepId);
    if (step) {
      if (typeof progress === 'boolean') {
        step.completed = progress;
      } else if (typeof progress === 'number') {
        step.current = Math.min(progress, step.target || progress);
      }
    }

    // 检查整个成就是否完成
    const isCompleted = achievement.steps.every(step => 
      step.completed || (step.current >= (step.target || 0))
    );

    return {
      achievement,
      isCompleted,
      progress: this.calculateAchievementProgress(achievement)
    };
  }

  calculateAchievementProgress(achievement) {
    const totalSteps = achievement.steps.length;
    const completedSteps = achievement.steps.filter(step => 
      step.completed || (step.current >= (step.target || 0))
    ).length;
    
    return {
      percentage: (completedSteps / totalSteps) * 100,
      completed: completedSteps,
      total: totalSteps
    };
  }

  getAchievements() {
    return this.achievements.map(achievement => ({
      ...achievement,
      progress: this.calculateAchievementProgress(achievement)
    }));
  }
}

// 挑战系统
class ChallengeService {
  constructor() {
    this.challenges = this.initializeChallenges();
    this.activeChallenges = new Map();
  }

  initializeChallenges() {
    return [
      {
        id: 'weekly_reduction',
        title: '周减排挑战',
        description: '本周碳足迹比上周减少20%',
        duration: 7, // 天
        reward: { type: 'badge', id: 'weekly_champion' },
        conditions: [
          { type: 'reduction_percentage', target: 20 }
        ]
      },
      {
        id: 'transport_free',
        title: '无车日挑战',
        description: '连续3天不使用私家车出行',
        duration: 3,
        reward: { type: 'badge', id: 'green_commuter' },
        conditions: [
          { type: 'no_private_transport', days: 3 }
        ]
      },
      {
        id: 'energy_conservation',
        title: '节能挑战',
        description: '本月用电量比上月减少15%',
        duration: 30,
        reward: { type: 'badge', id: 'energy_master' },
        conditions: [
          { type: 'electricity_reduction', target: 15 }
        ]
      }
    ];
  }

  startChallenge(userId, challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return { success: false, error: '挑战不存在' };

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + challenge.duration);

    const activeChallenge = {
      userId,
      challengeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      progress: 0,
      status: 'active'
    };

    this.activeChallenges.set(`${userId}_${challengeId}`, activeChallenge);
    return { success: true, challenge: activeChallenge };
  }

  updateChallengeProgress(userId, challengeId, activities) {
    const activeChallenge = this.activeChallenges.get(`${userId}_${challengeId}`);
    if (!activeChallenge || activeChallenge.status !== 'active') {
      return { success: false, error: '挑战未激活' };
    }

    const challenge = this.challenges.find(c => c.id === challengeId);
    const progress = this.calculateChallengeProgress(challenge, activities, activeChallenge);

    activeChallenge.progress = progress.percentage;
    
    if (progress.completed) {
      activeChallenge.status = 'completed';
      activeChallenge.completedDate = new Date().toISOString();
    } else if (new Date() > new Date(activeChallenge.endDate)) {
      activeChallenge.status = 'failed';
    }

    return { success: true, progress };
  }

  calculateChallengeProgress(challenge, activities, activeChallenge) {
    // 根据挑战类型计算进度
    switch (challenge.conditions[0].type) {
      case 'reduction_percentage':
        return this.calculateReductionProgress(activities, challenge.conditions[0].target);
      
      case 'no_private_transport':
        return this.calculateTransportFreeProgress(activities, challenge.conditions[0].days);
      
      case 'electricity_reduction':
        return this.calculateEnergyReductionProgress(activities, challenge.conditions[0].target);
      
      default:
        return { percentage: 0, completed: false };
    }
  }

  calculateReductionProgress(activities, targetReduction) {
    const now = new Date();
    const thisWeek = activities.filter(a => {
      const activityDate = new Date(a.created_at);
      return activityDate >= new Date(now.setDate(now.getDate() - 7));
    });
    
    const lastWeek = activities.filter(a => {
      const activityDate = new Date(a.created_at);
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return activityDate >= twoWeeksAgo && activityDate < oneWeekAgo;
    });

    const thisWeekTotal = thisWeek.reduce((sum, a) => sum + (a.kgco2e || 0), 0);
    const lastWeekTotal = lastWeek.reduce((sum, a) => sum + (a.kgco2e || 0), 0);

    if (lastWeekTotal === 0) return { percentage: 0, completed: false };

    const reductionPercentage = ((lastWeekTotal - thisWeekTotal) / lastWeekTotal) * 100;
    return {
      percentage: Math.min(100, (reductionPercentage / targetReduction) * 100),
      completed: reductionPercentage >= targetReduction
    };
  }

  calculateTransportFreeProgress(activities, targetDays) {
    const transportActivities = activities.filter(a => a.type === 'transport');
    const uniqueDays = new Set(
      transportActivities.map(a => new Date(a.created_at).toDateString())
    );
    
    const consecutiveDays = this.getConsecutiveDays([...uniqueDays]);
    const progress = Math.min(100, (consecutiveDays / targetDays) * 100);
    
    return {
      percentage: progress,
      completed: consecutiveDays >= targetDays
    };
  }

  calculateEnergyReductionProgress(activities, targetReduction) {
    const electricityActivities = activities.filter(a => a.type === 'electricity');
    // 简化计算，实际应该按月份统计
    const total = electricityActivities.reduce((sum, a) => sum + (a.amount || 0), 0);
    const progress = Math.min(100, (total / 100) * 100); // 简化处理
    
    return {
      percentage: progress,
      completed: total <= (100 - targetReduction) // 简化条件
    };
  }

  getConsecutiveDays(dates) {
    if (dates.length === 0) return 0;
    
    dates.sort();
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currentDate = new Date(dates[i]);
      const diffTime = Math.abs(currentDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    
    return maxConsecutive;
  }

  getUserActiveChallenges(userId) {
    const userChallenges = [];
    for (const [key, challenge] of this.activeChallenges.entries()) {
      if (key.startsWith(`${userId}_`)) {
        userChallenges.push(challenge);
      }
    }
    return userChallenges;
  }
}

// 导出服务实例
const badgeService = new BadgeService();
const achievementTracker = new AchievementTracker();
const challengeService = new ChallengeService();

export {
  BadgeService,
  AchievementTracker,
  ChallengeService,
  badgeService,
  achievementTracker,
  challengeService
};

export default {
  BadgeService,
  AchievementTracker,
  ChallengeService,
  badgeService,
  achievementTracker,
  challengeService
};