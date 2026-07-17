import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    avatar: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName.trim(),
      lastName: registerDto.lastName.trim(),
      role: registerDto.role || Role.TEAM_MEMBER,
    });

    return this.generateTokens(newUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const emailNormalized = loginDto.email.toLowerCase().trim();
    const user = await this.usersService.findOneByEmail(emailNormalized);

    // Provide friendly but secure validation messages
    if (!user) {
      throw new NotFoundException('No account was found with this email.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password.');
    }

    return this.generateTokens(user);
  }

  async refresh(token: string): Promise<AuthResponse> {
    const savedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!savedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (new Date() > savedToken.expiresAt) {
      await this.prisma.refreshToken.delete({ where: { id: savedToken.id } });
      throw new UnauthorizedException('Refresh token has expired.');
    }

    // Generate new set of tokens and rotate
    await this.prisma.refreshToken.delete({ where: { id: savedToken.id } });
    return this.generateTokens(savedToken.user);
  }

  async logout(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: { token },
      });
    } catch {
      // Quietly succeed if token doesn't exist
    }
  }

  private async generateTokens(user: any): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_SECRET') ||
        'senco-dev-jwt-secret-key-2026',
      expiresIn: (this.configService.get<string>('JWT_EXPIRATION') ||
        '15m') as any,
    });

    const refreshTokenString = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'senco-dev-jwt-refresh-secret-key-2026',
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
        '7d') as any,
    });

    // Save refresh token to DB
    const days = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}
