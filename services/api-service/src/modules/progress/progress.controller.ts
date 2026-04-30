import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ProgressService } from './progress.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('measurements')
  getMeasurements(@Request() req: any, @Query('limit') limit = '30') {
    return this.progressService.getMeasurements(req.user.sub, +limit)
  }

  @Post('measurements')
  addMeasurement(@Request() req: any, @Body() body: any) {
    return this.progressService.addMeasurement(req.user.sub, body)
  }

  @Get('body-composition')
  getBodyComposition(@Request() req: any) {
    return this.progressService.getBodyComposition(req.user.sub)
  }

  @Get('overview')
  getOverview(@Request() req: any) {
    return this.progressService.getOverview(req.user.sub)
  }
}
