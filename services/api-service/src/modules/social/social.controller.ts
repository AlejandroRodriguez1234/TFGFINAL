import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { SocialService } from './social.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('feed')
  getFeed(@Request() req: any) { return this.socialService.getFeed(req.user.sub) }

  @Post('posts')
  createPost(@Request() req: any, @Body() body: any) { return this.socialService.createPost(req.user.sub, body) }

  @Post('posts/:id/like')
  likePost(@Request() req: any, @Param('id') id: string) { return this.socialService.likePost(req.user.sub, id) }

  @Get('friends')
  getFriends(@Request() req: any) { return this.socialService.getFriends(req.user.sub) }

  @Post('friends/request')
  sendFriendRequest(@Request() req: any, @Body() body: { targetUserId: string }) {
    return this.socialService.sendFriendRequest(req.user.sub, body.targetUserId)
  }

  @Post('friends/:id/accept')
  acceptFriend(@Request() req: any, @Param('id') id: string) {
    return this.socialService.respondFriendRequest(req.user.sub, id, 'ACCEPTED')
  }

  @Get('leaderboard')
  getLeaderboard() { return this.socialService.getLeaderboard() }

  @Get('challenges')
  getChallenges(@Request() req: any) { return this.socialService.getChallenges(req.user.sub) }

  @Post('challenges')
  createChallenge(@Request() req: any, @Body() body: any) {
    return this.socialService.createChallenge(req.user.sub, body)
  }
}
