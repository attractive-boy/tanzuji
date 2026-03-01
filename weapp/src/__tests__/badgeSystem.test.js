// 徽章系统测试用例
import badgeManager from '../services/badgeManager';
import { badgeService, achievementTracker, challengeService } from '../services/badgeSystem';

describe('徽章系统测试', () => {
  // 测试数据
  const mockUserId = 'test-user-123';
  const mockActivities = [
    {
      id: '1',
      type: 'transport',
      kgco2e: 2.5,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'food',
      kgco2e: 1.2,
      description: '素食午餐',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      type: 'electricity',
      amount: 15,
      kgco2e: 8.5,
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    // 清理测试环境
    jest.clearAllMocks();
  });

  describe('徽章评估测试', () => {
    test('应该正确评估活动数量徽章', async () => {
      const result = await badgeManager.getUserBadgeStatus(mockUserId, mockActivities);
      
      expect(result.stats.totalBadges).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.badges)).toBe(true);
    });

    test('应该返回正确的徽章统计数据', async () => {
      const result = await badgeManager.getUserBadgeStatus(mockUserId, mockActivities);
      
      expect(result.stats).toHaveProperty('totalBadges');
      expect(result.stats).toHaveProperty('totalAchievements');
      expect(result.stats).toHaveProperty('activeChallenges');
    });
  });

  describe('成就系统测试', () => {
    test('应该能够初始化成就', () => {
      const achievements = achievementTracker.getAchievements();
      
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    test('应该能够更新成就进度', () => {
      const result = achievementTracker.updateAchievementProgress(
        mockUserId,
        'carbon_footprint_awareness',
        'read_about_carbon',
        true
      );
      
      expect(result).not.toBeNull();
      expect(result.achievement).toBeDefined();
    });

    test('应该正确计算成就进度', () => {
      const achievements = achievementTracker.getAchievements();
      const firstAchievement = achievements[0];
      
      expect(firstAchievement.progress).toBeDefined();
      expect(firstAchievement.progress.percentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('挑战系统测试', () => {
    test('应该能够开始挑战', async () => {
      const result = await badgeManager.startChallenge(mockUserId, 'weekly_reduction');
      
      expect(result.success).toBe(true);
      expect(result.challenge).toBeDefined();
      expect(result.challenge.userId).toBe(mockUserId);
    });

    test('应该能够获取用户活跃挑战', () => {
      const activeChallenges = challengeService.getUserActiveChallenges(mockUserId);
      
      expect(Array.isArray(activeChallenges)).toBe(true);
    });

    test('应该包含所有预定义的挑战', () => {
      const challenges = challengeService.challenges;
      
      expect(Array.isArray(challenges)).toBe(true);
      expect(challenges.length).toBeGreaterThan(0);
      
      const expectedChallenges = ['weekly_reduction', 'transport_free', 'energy_conservation'];
      expectedChallenges.forEach(challengeId => {
        const challenge = challenges.find(c => c.id === challengeId);
        expect(challenge).toBeDefined();
        expect(challenge.title).toBeDefined();
        expect(challenge.description).toBeDefined();
      });
    });
  });

  describe('徽章规则测试', () => {
    test('应该包含所有预定义的徽章', () => {
      const badges = badgeService.getAllBadges();
      
      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThan(0);
      
      // 检查关键徽章是否存在
      const keyBadges = ['first_record', 'five_records', 'low_carbon_week'];
      keyBadges.forEach(badgeId => {
        const badge = badges.find(b => b.id === badgeId);
        expect(badge).toBeDefined();
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
      });
    });

    test('应该能够按稀有度筛选徽章', () => {
      const rareBadges = badgeService.getBadgesByRarity('rare');
      const commonBadges = badgeService.getBadgesByRarity('common');
      
      expect(Array.isArray(rareBadges)).toBe(true);
      expect(Array.isArray(commonBadges)).toBe(true);
    });

    test('应该能够通过ID获取特定徽章', () => {
      const badge = badgeService.getBadgeById('first_record');
      
      expect(badge).toBeDefined();
      expect(badge.id).toBe('first_record');
      expect(badge.name).toBe('第一步');
    });
  });

  describe('边界情况测试', () => {
    test('处理空活动列表', async () => {
      const result = await badgeManager.getUserBadgeStatus(mockUserId, []);
      
      expect(result.stats.totalBadges).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.badges)).toBe(true);
    });

    test('处理无效用户ID', async () => {
      const result = await badgeManager.getUserBadgeStatus('', mockActivities);
      
      expect(result).toBeDefined();
    });

    test('处理无效挑战ID', async () => {
      const result = await badgeManager.startChallenge(mockUserId, 'invalid-challenge');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

// 性能测试
describe('徽章系统性能测试', () => {
  test('大量活动数据下的性能表现', async () => {
    const largeActivitySet = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      type: 'transport',
      kgco2e: Math.random() * 10,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    const startTime = performance.now();
    const result = await badgeManager.getUserBadgeStatus(mockUserId, largeActivitySet);
    const endTime = performance.now();

    expect(result).toBeDefined();
    expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
  });

  test('并发请求处理能力', async () => {
    const promises = Array.from({ length: 10 }, (_, i) => 
      badgeManager.getUserBadgeStatus(`user-${i}`, mockActivities)
    );

    const startTime = performance.now();
    const results = await Promise.all(promises);
    const endTime = performance.now();

    expect(results).toHaveLength(10);
    expect(results.every(r => r !== undefined)).toBe(true);
    expect(endTime - startTime).toBeLessThan(2000); // 10个并发请求应在2秒内完成
  });
});