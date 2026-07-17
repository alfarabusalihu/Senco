import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string, requestorRole?: Role): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // PROJECT_MANAGER cannot view ADMINISTRATOR profiles
    if (requestorRole === Role.PROJECT_MANAGER && user.role === Role.ADMINISTRATOR) {
      throw new NotFoundException('User not found.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const emailNormalized = data.email.toLowerCase().trim();
    const existingUser = await this.findOneByEmail(emailNormalized);
    if (existingUser) {
      throw new ConflictException(
        'An account was already found with this email.',
      );
    }

    return this.prisma.user.create({
      data: {
        ...data,
        email: emailNormalized,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const updateData: Prisma.UserUpdateInput = {};

    if (updateUserDto.firstName !== undefined) {
      updateData.firstName = updateUserDto.firstName.trim();
    }
    if (updateUserDto.lastName !== undefined) {
      updateData.lastName = updateUserDto.lastName.trim();
    }
    if (updateUserDto.avatar !== undefined) {
      updateData.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.email !== undefined) {
      const emailNormalized = updateUserDto.email.toLowerCase().trim();
      const existingUser = await this.findOneByEmail(emailNormalized);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'An account was already found with this email.',
        );
      }
      updateData.email = emailNormalized;
    }

    if (updateUserDto.password !== undefined) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = updatedUser;
    return result;
  }

  async findAll(requestorRole: Role, filterRole?: Role): Promise<Omit<User, 'password'>[]> {
    const where: Prisma.UserWhereInput = {};

    // PROJECT_MANAGER can only see TEAM_MEMBER users
    if (requestorRole === Role.PROJECT_MANAGER) {
      where.role = Role.TEAM_MEMBER;
    } else if (filterRole) {
      // ADMINISTRATOR can filter by any role
      where.role = filterRole;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password: _password, ...user }) => user);
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
