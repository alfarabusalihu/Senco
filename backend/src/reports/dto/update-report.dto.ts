import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto {
  @ApiPropertyOptional({ example: 'projectId-here' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ example: 28 })
  @IsInt()
  @Min(1)
  @Max(53)
  @IsOptional()
  weekNumber?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: '2026-07-06T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-10T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: '• Implemented user auth' })
  @IsString()
  @IsOptional()
  tasksCompleted?: string;

  @ApiPropertyOptional({ example: '• Design dashboard cards' })
  @IsString()
  @IsOptional()
  tasksPlanned?: string;

  @ApiPropertyOptional({ example: 'Waiting on design guidelines' })
  @IsString()
  @IsOptional()
  blockers?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber()
  @Min(0, { message: 'Hours worked cannot be negative.' })
  @Max(168, { message: 'Hours worked cannot exceed 168 hours in a week.' })
  @IsOptional()
  hoursWorked?: number;

  @ApiPropertyOptional({ example: 'Looking forward to the feedback' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  submit?: boolean;
}
