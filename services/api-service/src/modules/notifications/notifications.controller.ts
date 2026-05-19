import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: any) { return this.notificationsService.findAll(req.user.sub) }

  @Post('read-all')
  markAllRead(@Request() req: any) { return this.notificationsService.markAllRead(req.user.sub) }

  @Post(':id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.sub, id)
  }
}
