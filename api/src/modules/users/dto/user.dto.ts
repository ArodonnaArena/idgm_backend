import { IsEmail, IsString, IsOptional, IsEnum, IsArray } from 'class-validator'

// Local enum mirror of Prisma UserStatus to avoid client export differences
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

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
  @IsEnum(USER_STATUS)
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
  @IsEnum(USER_STATUS)
  status?: UserStatus
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds: string[]
}
