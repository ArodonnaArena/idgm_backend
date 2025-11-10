import { Body, Controller, Post } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

@Controller('paystack')
export class PaymentsController {
  private paystackSecret = process.env.PAYSTACK_SECRET_KEY || ''
  constructor(private prisma: PrismaClient) {}

  @Post('initialize')
  async initialize(@Body() body: { email: string; amount: number; currency?: string }) {
    const payload = { email: body.email, amount: Math.round(body.amount * 100), currency: body.currency || 'NGN' }
    const res = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: { Authorization: `Bearer ${this.paystackSecret}`, 'Content-Type': 'application/json' },
    })
    return res.data
  }

  @Post('webhook')
  async webhook(@Body() event: any) {
    // TODO: verify signature (x-paystack-signature) before trusting webhook
    // Then update Payment/Order accordingly
    return { received: true }
  }
}