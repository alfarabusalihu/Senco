import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'model', 'system'] })
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'model' | 'system';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatDto {
  @ApiProperty({ example: 'What did the team accomplish this week?' })
  @IsString()
  @IsNotEmpty({ message: 'Message is required.' })
  message: string;

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
