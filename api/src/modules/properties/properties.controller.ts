import { Controller, Get, Param, Query } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Controller('properties')
export class PropertiesController {
  constructor(private prisma: PrismaClient) {}

  @Get()
  async list(@Query('q') q?: string) {
    return this.prisma.property.findMany({
      where: { isActive: true, OR: q ? [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] : undefined },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    return this.prisma.property.findUnique({ where: { slug }, include: { images: true, units: true } })
  }
}