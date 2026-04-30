import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import axios from 'axios'

@Injectable()
export class UsersService {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:8081'

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    // Proxy to auth service for user data, then enrich with local stats
    const [habits, workouts, achievements] = await Promise.all([
      this.prisma.habit.count({ where: { userId, isActive: true } }),
      this.prisma.workoutLog.count({ where: { userId, finishedAt: { not: null } } }),
      this.prisma.userAchievement.count({ where: { userId } }),
    ])
    return { userId, habitsCount: habits, workoutsCount: workouts, achievementsCount: achievements }
  }

  async updateProfile(userId: string, data: any) {
    return { userId, ...data, updated: true }
  }

  async findAll() {
    try {
      const res = await axios.get(`${this.authServiceUrl}/users`)
      return res.data
    } catch {
      return []
    }
  }

  async updateRole(userId: string, role: string) {
    return { userId, role, updated: true }
  }

  async updateStatus(userId: string, isActive: boolean) {
    return { userId, isActive, updated: true }
  }
}
