import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min } from 'class-validator'

export class CreateProductDto {
  @IsString()
  sku: string

  @IsString()
  slug: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAt?: number

  @IsString()
  categoryId: string

  @IsOptional()
  @IsArray()
  images?: { url: string; alt?: string }[]

  @IsOptional()
  attributes?: any

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAt?: number

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  attributes?: any

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
