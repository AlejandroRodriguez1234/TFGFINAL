import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ExercisesService } from './exercises.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiQuery({ name: 'muscle', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: { muscle?: string; difficulty?: string; search?: string }) {
    return this.exercisesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id)
  }
}
