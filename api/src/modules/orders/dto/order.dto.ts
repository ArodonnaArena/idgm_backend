import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

// Local enum mirror of Prisma OrderStatus to avoid client export differences
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

export class CreateOrderItemDto {
  @IsString()
  productId: string

  @IsNumber()
  @Min(1)
  quantity: number

  @IsNumber()
  @Min(0)
  price: number
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsArray()
  items: CreateOrderItemDto[]

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsString()
  shippingId?: string

  @IsOptional()
  @IsString()
  billingId?: string
}

export class UpdateOrderStatusDto {
  @IsEnum(ORDER_STATUS)
  status: OrderStatus
}
