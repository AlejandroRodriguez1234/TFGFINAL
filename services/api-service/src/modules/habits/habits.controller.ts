import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { HabitsService } from './habits.service'
import { CreateHabitDto } from './dto/create-habit.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.habitsService.findAll(req.user.sub)
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateHabitDto) {
    return this.habitsService.create(req.user.sub, dto)
  }

  @Post(':id/complete')
  complete(@Request() req: any, @Param('id') id: string) {
    return this.habitsService.toggleComplete(req.user.sub, id)
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateHabitDto>) {
    return this.habitsService.update(req.user.sub, id, dto)
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.habitsService.remove(req.user.sub, id)
  }

  @Get('stats')
  stats(@Request() req: any) {
    return this.habitsService.getStats(req.user.sub)
  }
}
