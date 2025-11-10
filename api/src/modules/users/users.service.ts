import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from './dto/user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async findAll(skip = 0, take = 50, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          roles: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      users: users.map((u) => ({
        ...u,
        passwordHash: undefined,
        roles: u.roles.map((r) => r.role.name),
      })),
      total,
      skip,
      take,
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
        addresses: true,
        tenantProfile: true,
        landlordProfile: true,
        staffProfile: true,
      },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return {
      ...user,
      passwordHash: undefined,
      roles: user.roles.map((r) => ({ id: r.role.id, name: r.role.name })),
    }
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

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
        status: dto.status || 'ACTIVE',
      },
    })

    if (dto.roleIds && dto.roleIds.length > 0) {
      await Promise.all(
        dto.roleIds.map((roleId) =>
          this.prisma.userRole.create({
            data: { userId: user.id, roleId },
          })
        )
      )
    }

    return this.findOne(user.id)
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })
      if (existing) {
        throw new ConflictException('Email already in use')
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: dto,
    })

    return this.findOne(id)
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    await this.prisma.user.delete({ where: { id } })
    return { message: 'User deleted successfully' }
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    // Remove existing roles
    await this.prisma.userRole.deleteMany({ where: { userId: id } })

    // Assign new roles
    await Promise.all(
      dto.roleIds.map((roleId) =>
        this.prisma.userRole.create({
          data: { userId: id, roleId },
        })
      )
    )

    return this.findOne(id)
  }
}
