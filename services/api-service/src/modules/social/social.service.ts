import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: string) {
    // Get friend IDs
    const friendships = await this.prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }], status: 'ACCEPTED' },
    })
    const friendIds = friendships.map(f => f.requesterId === userId ? f.addresseeId : f.requesterId)

    return this.prisma.post.findMany({
      where: { userId: { in: [...friendIds, userId] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }

  async createPost(userId: string, data: any) {
    return this.prisma.post.create({ data: { ...data, userId } })
  }

  async likePost(userId: string, postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    })
  }

  async getFriends(userId: string) {
    return this.prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }], status: 'ACCEPTED' },
    })
  }

  async sendFriendRequest(requesterId: string, addresseeId: string) {
    return this.prisma.friendship.create({
      data: { requesterId, addresseeId, status: 'PENDING' },
    })
  }

  async respondFriendRequest(userId: string, friendshipId: string, status: 'ACCEPTED' | 'REJECTED') {
    return this.prisma.friendship.update({ where: { id: friendshipId }, data: { status } })
  }

  async getLeaderboard() {
    // Returns top users by XP (fetched from auth service in real implementation)
    return []
  }

  async getChallenges(userId: string) {
    return this.prisma.challenge.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { participants: { path: '$[*].userId', array_contains: userId } },
        ],
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createChallenge(userId: string, data: any) {
    return this.prisma.challenge.create({
      data: {
        ...data,
        creatorId: userId,
        status: 'PENDING',
        participants: [{ userId, current: 0 }],
      },
    })
  }
}
