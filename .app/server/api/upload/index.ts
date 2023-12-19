import fs from 'fs'
import { callNodeListener } from 'h3'
import multer from 'multer'
import path from 'path'
const rootPath = `${process.cwd()}`

const BASE_UPLOAD_DIR = `${rootPath}/public/uploads`

const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
]

// Ensure upload directory exists
fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (
    req: any,
    file: any,
    cb: (arg0: null, arg1: string) => void,
  ) => {
    cb(null, BASE_UPLOAD_DIR)
  },
  filename: (
    req: any,
    file: { originalname: string },
    cb: (arg0: null, arg1: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    const filename = `${uniqueSuffix}${extension}`
    cb(null, filename)
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (
    req: any,
    file: { mimetype: string },
    cb: (arg0: Error | null, arg1: boolean | undefined) => void,
  ) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  },
}).array('files')

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
}

function moveFilesToTypeDirectory(files, type) {
  const typeDirectory = path.join(BASE_UPLOAD_DIR, type)

  ensureDirectoryExists(typeDirectory)

  files.forEach((file) => {
    const sourcePath = path.join(BASE_UPLOAD_DIR, file.filename)
    const destPath = path.join(typeDirectory, file.filename)

    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, destPath)
    }
  })
}

function removeOldImageIfAvatar(oldImagePath: string) {
  if (oldImagePath) {
    const oldImageFullPath = `${rootPath}/public/${oldImagePath}`
    if (fs.existsSync(oldImageFullPath)) {
      fs.unlinkSync(oldImageFullPath)
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    await callNodeListener(upload, event.node.req, event.node.res)

    const type = event.node.req.body.type || 'default'
    const oldImagePath = event.node.req.body.oldImagePath

    if (Array.isArray(event.node.req.files)) {
      moveFilesToTypeDirectory(event.node.req.files, type)
    } else {
      throw new Error('No files uploaded')
    }

    moveFilesToTypeDirectory(event.node.req.files, type)
    removeOldImageIfAvatar(oldImagePath)

    const imagePaths = event.node.req.files.map(
      (file: { filename: any }) => `/uploads/${type}/${file.filename}`,
    )

    if (type === 'avatar' && event.node.req.files.length === 1) {
      return imagePaths[0]
    }

    return imagePaths
  } catch (error) {
    console.error(error)
    return createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
