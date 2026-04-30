import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { muscle?: string; difficulty?: string; search?: string }) {
    return this.prisma.exercise.findMany({
      where: {
        ...(query.muscle && { muscleGroups: { has: query.muscle.toUpperCase() as any } }),
        ...(query.difficulty && { difficulty: query.difficulty.toUpperCase() as any }),
        ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } })
    if (!exercise) throw new NotFoundException('Ejercicio no encontrado')
    return exercise
  }
}
