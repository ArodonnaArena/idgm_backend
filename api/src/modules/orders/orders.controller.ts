import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { OrdersService } from './orders.service'
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  async list(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0
    const takeNum = take ? parseInt(take, 10) : 50
    return this.orders.list(skipNum, takeNum, status, userId)
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.orders.get(id)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto)
  }
}
