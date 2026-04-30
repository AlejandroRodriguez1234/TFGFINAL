import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './common/prisma/prisma.module'
import { HabitsModule } from './modules/habits/habits.module'
import { GymModule } from './modules/gym/gym.module'
import { ProgressModule } from './modules/progress/progress.module'
import { SocialModule } from './modules/social/social.module'
import { GamificationModule } from './modules/gamification/gamification.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    HabitsModule,
    GymModule,
    ProgressModule,
    SocialModule,
    GamificationModule,
    NotificationsModule,
  ],
})
export class AppModule {}
