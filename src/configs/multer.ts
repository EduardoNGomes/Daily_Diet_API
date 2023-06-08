import multer from 'fastify-multer'
import { resolve } from 'path'
import crypto from 'crypto'

export const UPLOAD = resolve(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD)
  },
  filename: function (req, file, cb) {
    const fileHash = crypto.randomBytes(10).toString('hex')
    const filename = `${fileHash}-${file.originalname}`
    return cb(null, filename)
  },
})

export const upload = multer({ storage })
