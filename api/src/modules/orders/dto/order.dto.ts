import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { OrderStatus } from '@prisma/client'

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
  @IsEnum(OrderStatus)
  status: OrderStatus
}
