import { config } from 'dotenv'
import { z } from 'zod'

config()
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
})

export const env = envSchema.parse(process.env)
