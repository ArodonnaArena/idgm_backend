import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaClient) {}

  async findAll(skip = 0, take = 50, search?: string, categoryId?: string) {
    const where: any = { isActive: true }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          images: true,
          category: true,
          inventory: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ])

    return { products, total, skip, take }
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        inventory: true,
      },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        inventory: true,
      },
    })

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`)
    }

    return product
  }

  async create(dto: CreateProductDto) {
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    })
    if (existingSku) {
      throw new ConflictException('SKU already exists')
    }

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    })
    if (existingSlug) {
      throw new ConflictException('Slug already exists')
    }

    const { images, ...productData } = dto
    
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        inventory: {
          create: {
            quantity: 0,
            threshold: 5,
          },
        },
      },
      include: {
        images: true,
        category: true,
        inventory: true,
      },
    })

    return product
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      })
      if (existing) {
        throw new ConflictException('SKU already exists')
      }
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      })
      if (existing) {
        throw new ConflictException('Slug already exists')
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        images: true,
        category: true,
        inventory: true,
      },
    })
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    await this.prisma.product.delete({ where: { id } })
    return { message: 'Product deleted successfully' }
  }

  async updateInventory(id: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { inventory: true },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    if (!product.inventory) {
      return this.prisma.inventory.create({
        data: {
          productId: id,
          quantity,
          threshold: 5,
        },
      })
    }

    return this.prisma.inventory.update({
      where: { productId: id },
      data: { quantity },
    })
  }
}
