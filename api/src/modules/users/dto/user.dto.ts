import { IsEmail, IsString, IsOptional, IsEnum, IsArray } from 'class-validator'
import { UserStatus } from '@prisma/client'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[]
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds: string[]
}
