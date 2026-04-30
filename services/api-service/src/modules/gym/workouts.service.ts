import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { subDays } from 'date-fns'

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplates(userId: string) {
    return this.prisma.workoutTemplate.findMany({
      where: { OR: [{ userId }, { isPublic: true, userId: null }] },
      include: { exercises: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createTemplate(userId: string, data: any) {
    const { exercises, ...rest } = data
    return this.prisma.workoutTemplate.create({
      data: {
        ...rest, userId,
        exercises: { create: exercises.map((e: any, i: number) => ({ ...e, order: i })) },
      },
      include: { exercises: true },
    })
  }

  async getLogs(userId: string) {
    return this.prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })
  }

  async createLog(userId: string, data: any) {
    return this.prisma.workoutLog.create({
      data: { ...data, userId, startedAt: new Date() },
    })
  }

  async finishLog(userId: string, logId: string, data: any) {
    const log = await this.prisma.workoutLog.findFirst({ where: { id: logId, userId } })
    if (!log) throw new NotFoundException('Log no encontrado')

    const durationMin = Math.round((Date.now() - log.startedAt.getTime()) / 60000)
    const xpEarned    = Math.min(200, Math.floor(durationMin * 1.5))

    return this.prisma.workoutLog.update({
      where: { id: logId },
      data: { ...data, finishedAt: new Date(), durationMin, xpEarned },
    })
  }

  async getRoutines(userId: string) {
    return this.prisma.routine.findMany({
      where: { userId },
      include: { days: { include: { template: true } } },
    })
  }

  async createRoutine(userId: string, data: any) {
    const { days, ...rest } = data
    return this.prisma.routine.create({
      data: {
        ...rest, userId,
        days: { create: days },
      },
      include: { days: true },
    })
  }

  async getStats(userId: string) {
    const [totalLogs, weekLogs, totalVolume] = await Promise.all([
      this.prisma.workoutLog.count({ where: { userId, finishedAt: { not: null } } }),
      this.prisma.workoutLog.count({
        where: { userId, finishedAt: { not: null }, startedAt: { gte: subDays(new Date(), 7) } },
      }),
      this.prisma.workoutLog.aggregate({
        where: { userId, totalVolume: { not: null } },
        _sum: { totalVolume: true },
      }),
    ])
    return { totalWorkouts: totalLogs, workoutsThisWeek: weekLogs, totalVolume: totalVolume._sum.totalVolume ?? 0 }
  }
}
