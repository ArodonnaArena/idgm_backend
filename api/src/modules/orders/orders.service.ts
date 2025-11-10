import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaClient) {}

  async list(skip = 0, take = 50, status?: string, userId?: string) {
    const where: any = {}
    const allowed = ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED']
    if (status && allowed.includes(status)) where.status = status
    if (userId) where.userId = userId

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: { items: { include: { product: true } }, user: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])

    return { orders, total, skip, take }
  }

  async get(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true, payment: true },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async create(dto: CreateOrderDto) {
    const total = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        currency: dto.currency || 'NGN',
        total,
        shippingId: dto.shippingId,
        billingId: dto.billingId,
        items: {
          create: dto.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        },
      },
      include: { items: true },
    })

    return order
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order) throw new NotFoundException('Order not found')
    return this.prisma.order.update({ where: { id }, data: { status: dto.status } })
  }
}
