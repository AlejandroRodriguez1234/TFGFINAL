import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { GamificationService } from './gamification.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('achievements')
  getAll(@Request() req: any) { return this.gamificationService.getAllAchievements(req.user.sub) }

  @Get('achievements/unlocked')
  getUnlocked(@Request() req: any) { return this.gamificationService.getUserAchievements(req.user.sub) }
}
