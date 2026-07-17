import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123!',
    description: 'Minimum 6 characters',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
