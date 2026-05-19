import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { WorkoutsService } from './workouts.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get('templates')
  getTemplates(@Request() req: any) {
    return this.workoutsService.getTemplates(req.user.sub)
  }

  @Post('templates')
  createTemplate(@Request() req: any, @Body() body: any) {
    return this.workoutsService.createTemplate(req.user.sub, body)
  }

  @Get('logs')
  getLogs(@Request() req: any) {
    return this.workoutsService.getLogs(req.user.sub)
  }

  @Post('logs')
  createLog(@Request() req: any, @Body() body: any) {
    return this.workoutsService.createLog(req.user.sub, body)
  }

  @Put('logs/:id/finish')
  finishLog(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.workoutsService.finishLog(req.user.sub, id, body)
  }

  @Get('routines')
  getRoutines(@Request() req: any) {
    return this.workoutsService.getRoutines(req.user.sub)
  }

  @Post('routines')
  createRoutine(@Request() req: any, @Body() body: any) {
    return this.workoutsService.createRoutine(req.user.sub, body)
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.workoutsService.getStats(req.user.sub)
  }
}
