import { Controller, Post, UploadedFile, UseInterceptors, Req } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import type { Request } from 'express'

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname)
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
          cb(null, name)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const urlPath = `/uploads/${file.filename}`
    const base = `${req.protocol}://${req.get('host')}`
    const absoluteUrl = `${base}${urlPath}`
    return { url: absoluteUrl, path: urlPath, filename: file.filename, size: file.size, mimetype: file.mimetype }
  }
}
