import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Client Portal Redesign' })
  @IsString()
  @IsNotEmpty({ message: 'Project name is required.' })
  name: string;

  @ApiPropertyOptional({
    example: 'Complete redesign of the client-facing portal.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
