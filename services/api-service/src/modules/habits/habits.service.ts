import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateHabitDto } from './dto/create-habit.dto'
import { startOfDay, endOfDay } from 'date-fns'

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, isActive: true },
      include: { logs: { where: { completedAt: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) } } } },
      orderBy: { createdAt: 'asc' },
    })
    return habits.map(h => ({ ...h, completedToday: h.logs.length > 0, logs: undefined }))
  }

  async create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: { ...dto, userId, targetDays: dto.targetDays ?? [1, 2, 3, 4, 5] } as any,
    })
  }

  async toggleComplete(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findFirst({ where: { id: habitId, userId } })
    if (!habit) throw new NotFoundException('Hábito no encontrado')

    const today = new Date()
    const existingLog = await this.prisma.habitLog.findFirst({
      where: { habitId, completedAt: { gte: startOfDay(today), lte: endOfDay(today) } },
    })

    if (existingLog) {
      await this.prisma.habitLog.delete({ where: { id: existingLog.id } })
      await this.prisma.habit.update({ where: { id: habitId }, data: { streak: Math.max(0, habit.streak - 1) } })
      return { completedToday: false, streak: Math.max(0, habit.streak - 1) }
    }

    await this.prisma.habitLog.create({ data: { habitId } })
    const newStreak = habit.streak + 1
    await this.prisma.habit.update({
      where: { id: habitId },
      data: { streak: newStreak, longestStreak: Math.max(habit.longestStreak, newStreak) },
    })
    return { completedToday: true, streak: newStreak }
  }

  async update(userId: string, habitId: string, dto: Partial<CreateHabitDto>) {
    await this.findOwned(userId, habitId)
    return this.prisma.habit.update({ where: { id: habitId }, data: dto as any })
  }

  async remove(userId: string, habitId: string) {
    await this.findOwned(userId, habitId)
    return this.prisma.habit.update({ where: { id: habitId }, data: { isActive: false } })
  }

  async getStats(userId: string) {
    const habits = await this.prisma.habit.findMany({ where: { userId, isActive: true } })
    const today  = new Date()
    const logs   = await this.prisma.habitLog.findMany({
      where: { habitId: { in: habits.map(h => h.id) }, completedAt: { gte: startOfDay(today), lte: endOfDay(today) } },
    })
    return {
      total: habits.length,
      completedToday: logs.length,
      bestStreak: Math.max(...habits.map(h => h.longestStreak), 0),
      avgCompletionRate: habits.length > 0 ? habits.reduce((a, h) => a + h.completionRate, 0) / habits.length : 0,
    }
  }

  private async findOwned(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findFirst({ where: { id: habitId, userId } })
    if (!habit) throw new NotFoundException('Hábito no encontrado')
    return habit
  }
}
