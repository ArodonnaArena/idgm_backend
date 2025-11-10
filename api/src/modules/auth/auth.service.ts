import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaClient, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    })

    // Assign CUSTOMER role by default
    const customerRole = await this.prisma.role.findUnique({ where: { name: 'CUSTOMER' } })
    if (customerRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: customerRole.id,
        },
      })
    }

    return user
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const roles = user.roles.map((r) => r.role.name)
    const payload = { sub: user.id, email: user.email, roles }
    const accessToken = await this.jwt.signAsync(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
      },
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    
    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found')
    }

    const isValid = await bcrypt.compare(dto.oldPassword, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10)
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    })

    return { message: 'Password changed successfully' }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    })
  }
}
