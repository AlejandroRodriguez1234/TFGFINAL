import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    })
  }

  async getAllAchievements(userId: string) {
    const [all, unlocked] = await Promise.all([
      this.prisma.achievement.findMany(),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ])
    const unlockedMap = new Map(unlocked.map(u => [u.achievementId, u.unlockedAt]))
    return all.map(a => ({ ...a, isUnlocked: unlockedMap.has(a.id), unlockedAt: unlockedMap.get(a.id) ?? null }))
  }

  async checkAndAwardAchievements(userId: string, context: { workoutCount?: number; streakDays?: number }) {
    const awarded: string[] = []

    const checks = [
      { key: 'FIRST_WORKOUT',  condition: context.workoutCount === 1 },
      { key: 'STREAK_7',       condition: (context.streakDays ?? 0) >= 7 },
      { key: 'STREAK_30',      condition: (context.streakDays ?? 0) >= 30 },
      { key: 'WORKOUT_10',     condition: (context.workoutCount ?? 0) >= 10 },
      { key: 'WORKOUT_50',     condition: (context.workoutCount ?? 0) >= 50 },
      { key: 'WORKOUT_100',    condition: (context.workoutCount ?? 0) >= 100 },
    ]

    for (const check of checks) {
      if (!check.condition) continue
      const achievement = await this.prisma.achievement.findUnique({ where: { key: check.key } })
      if (!achievement) continue
      const exists = await this.prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
      })
      if (exists) continue
      await this.prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } })
      awarded.push(achievement.name)
    }

    return awarded
  }
}
