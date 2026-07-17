import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Update current user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(userId, updatePasswordDto);
    return { success: true, message: 'Password updated successfully' };
  }

  @Get()
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'List all users (Manager/Admin)' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully.',
  })
  async getAllUsers(
    @CurrentUser() currentUser: any,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll(currentUser.role, role);
  }

  @Get(':id')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get user by ID (Manager/Admin)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  async getUserById(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    return this.usersService.findOneById(id, currentUser.role);
  }
}
