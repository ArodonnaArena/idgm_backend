import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
app.use(cors())
app.use(express.json())
const prisma = new PrismaClient()

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ include: { images: true } })
  res.json(products)
})

app.get('/api/properties', async (req, res) => {
  const properties = await prisma.property.findMany({ include: { images: true } })
  res.json(properties)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API listening on :${PORT}`))