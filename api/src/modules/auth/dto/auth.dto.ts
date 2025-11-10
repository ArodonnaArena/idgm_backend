import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string

  @IsString()
  @MinLength(8)
  newPassword: string
}
