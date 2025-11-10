import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: { take: 10, include: { images: true } },
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    })

    if (existing) {
      throw new ConflictException('Category slug already exists')
    }

    return this.prisma.category.create({
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    })
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      })
      if (existing) {
        throw new ConflictException('Category slug already exists')
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    })
  }

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    if (category._count.products > 0) {
      throw new ConflictException('Cannot delete category with products')
    }

    if (category._count.children > 0) {
      throw new ConflictException('Cannot delete category with subcategories')
    }

    await this.prisma.category.delete({ where: { id } })
    return { message: 'Category deleted successfully' }
  }
}
