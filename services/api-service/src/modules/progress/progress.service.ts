import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeasurements(userId: string, limit: number) {
    return this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    })
  }

  async addMeasurement(userId: string, data: any) {
    const bmi = data.weight && data.height
      ? parseFloat((data.weight / Math.pow(data.height / 100, 2)).toFixed(1))
      : undefined

    return this.prisma.bodyMeasurement.create({
      data: { ...data, userId, bmi },
    })
  }

  async getBodyComposition(userId: string) {
    const latest = await this.prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    })
    const monthAgo = await this.prisma.bodyMeasurement.findFirst({
      where: { userId, date: { lte: new Date(Date.now() - 30 * 86400000) } },
      orderBy: { date: 'desc' },
    })

    if (!latest) return null

    return {
      current: latest,
      changes: monthAgo ? {
        weight:  parseFloat((latest.weight - monthAgo.weight).toFixed(1)),
        bodyFat: latest.bodyFat && monthAgo.bodyFat
          ? parseFloat((latest.bodyFat - monthAgo.bodyFat).toFixed(1))
          : null,
        muscleMass: latest.muscleMass && monthAgo.muscleMass
          ? parseFloat((latest.muscleMass - monthAgo.muscleMass).toFixed(1))
          : null,
      } : null,
    }
  }

  async getOverview(userId: string) {
    const [measurements, workoutCount, habitCount] = await Promise.all([
      this.prisma.bodyMeasurement.findMany({ where: { userId }, orderBy: { date: 'asc' }, take: 30 }),
      this.prisma.workoutLog.count({ where: { userId, finishedAt: { not: null } } }),
      this.prisma.habit.count({ where: { userId, isActive: true } }),
    ])
    return { measurements, workoutCount, habitCount }
  }
}
