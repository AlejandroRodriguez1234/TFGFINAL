import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) { return this.usersService.getProfile(req.user.sub) }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.sub, body)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() { return this.usersService.findAll() }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.updateRole(id, body.role)
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.usersService.updateStatus(id, body.isActive)
  }
}
