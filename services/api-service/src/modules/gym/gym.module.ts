import { Module } from '@nestjs/common'
import { ExercisesController } from './exercises.controller'
import { ExercisesService } from './exercises.service'
import { WorkoutsController } from './workouts.controller'
import { WorkoutsService } from './workouts.service'

@Module({
  controllers: [ExercisesController, WorkoutsController],
  providers: [ExercisesService, WorkoutsService],
  exports: [WorkoutsService],
})
export class GymModule {}
