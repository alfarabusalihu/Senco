import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'projectId-here' })
  @IsString()
  @IsNotEmpty({ message: 'Project is required.' })
  projectId: string;

  @ApiProperty({ example: 28 })
  @IsInt()
  @Min(1)
  @Max(53)
  @IsNotEmpty({ message: 'Week number is required.' })
  weekNumber: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsNotEmpty({ message: 'Year is required.' })
  year: number;

  @ApiProperty({ example: '2026-07-06T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required.' })
  startDate: string;

  @ApiProperty({ example: '2026-07-10T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty({ message: 'End date is required.' })
  endDate: string;

  @ApiProperty({
    example: '• Implemented user auth\n• Created database models',
  })
  @IsString()
  @IsNotEmpty({ message: 'Completed tasks are required.' })
  tasksCompleted: string;

  @ApiProperty({ example: '• Design dashboard cards' })
  @IsString()
  @IsNotEmpty({ message: 'Planned tasks are required.' })
  tasksPlanned: string;

  @ApiPropertyOptional({ example: 'Waiting on design guidelines' })
  @IsString()
  @IsOptional()
  blockers?: string;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @Min(0, { message: 'Hours worked cannot be negative.' })
  @Max(168, { message: 'Hours worked cannot exceed 168 hours in a week.' })
  @IsNotEmpty({ message: 'Hours worked is required.' })
  hoursWorked: number;

  @ApiPropertyOptional({ example: 'Looking forward to the feedback' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'True if direct submit, false or omitted if draft',
  })
  @IsOptional()
  submit?: boolean;
}
