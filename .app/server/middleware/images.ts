import fs from 'fs'
import { defineEventHandler } from 'h3'
import mime from 'mime'
import path from 'path'

const rootPath = process.cwd()

const BASE_UPLOAD_DIR = path.join(rootPath, 'public', 'uploads')
const BASE_CRYPTO_IMAGE = path.join(rootPath, '.app', 'public', 'img', 'crypto')
const BASE_PLACEHOLDER_IMAGE = path.join(
  rootPath,
  '.app',
  'public',
  'img',
  'placeholder.png',
)

const sendFile = (res: any, filePath: string) => {
  try {
    const mimeType = mime.getType(filePath) || 'application/octet-stream'
    const data = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': mimeType })
    res.write(data)
    res.end()
  } catch (error) {
    res.writeHead(404)
    res.end('Not found')
  }
}

export default defineEventHandler(async (event) => {
  const { req, res } = event.node
  const { url } = req
  if (!url) return

  if (url.startsWith('/uploads')) {
    const filePath = path.join(
      BASE_UPLOAD_DIR,
      decodeURIComponent(url.replace('/uploads/', '')),
    )
    if (fs.existsSync(filePath)) {
      sendFile(res, filePath)
    } else {
      res.writeHead(404)
      res.end('File not found')
    }
  }

  if (url.startsWith('/img/crypto')) {
    const filePath = path.join(
      BASE_CRYPTO_IMAGE,
      decodeURIComponent(url.replace('/img/crypto', '')),
    )
    if (fs.existsSync(filePath)) {
      sendFile(res, filePath)
    } else {
      sendFile(res, BASE_PLACEHOLDER_IMAGE)
    }
  }
})
