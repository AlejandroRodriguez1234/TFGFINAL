import { IsString, IsOptional, IsEnum, IsArray, IsInt } from 'class-validator'

export class CreateHabitDto {
  @IsString() name: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() icon?: string
  @IsOptional() @IsString() color?: string
  @IsOptional() @IsEnum(['DAILY', 'WEEKLY', 'CUSTOM']) frequency?: string
  @IsOptional() @IsArray() @IsInt({ each: true }) targetDays?: number[]
}
