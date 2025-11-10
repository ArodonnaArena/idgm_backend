import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ProductsModule } from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { PropertiesModule } from './properties/properties.module'
import { PaymentsModule } from './payments/payments.module'
import { UploadModule } from './upload/upload.module'
import { OrdersModule } from './orders/orders.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    PropertiesModule,
    PaymentsModule,
    UploadModule,
    OrdersModule,
  ],
})
export class AppModule {}
