import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if the AI Assistant is enabled' })
  @ApiResponse({ status: 200, description: 'Returns connection status.' })
  getStatus() {
    return { enabled: this.aiService.isEnabled() };
  }

  @Post('chat')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Send a message to the AI Assistant (Manager/Admin)',
  })
  @ApiResponse({ status: 200, description: 'Returns assistant reply.' })
  async chat(@Body() chatDto: ChatDto) {
    const response = await this.aiService.chat(
      chatDto.message,
      chatDto.history,
    );
    return { response };
  }
}
