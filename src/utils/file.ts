import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '@/constants/dir'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { isEmpty } from 'lodash'
import path from 'path'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 1,
    maxFileSize: 100 * 1024 * 1024,
    maxTotalFileSize: 200 * 1024 * 1024,
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!isValid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return isValid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (isEmpty(files)) {
        return reject(new Error('File is empty'))
      }

      resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 200 * 1024 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const isValid = name === 'video' && Boolean(mimetype?.includes('video/') || mimetype?.includes('quicktime'))

      if (!isValid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return isValid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (isEmpty(files)) {
        return reject(new Error('File is empty'))
      }

      const videos = files.video as File[]

      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`)
        video.newFilename = `${video.newFilename}.${ext}`
        video.filepath = `${video.filepath}.${ext}`
      })

      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const name = fullName.split('.')
  name.pop()
  return name.join('')
}

export const getExtension = (fullName: string) => {
  const name = fullName.split('.')
  return name[name.length - 1]
}

// Cách xử lý chuẩn khi upload video và encode
// có 2 giai đoạn
// Upload video: Upload video thành công khi resolve về cho người dùng
// Encode video : Khai náo thêm 1 url endponit để check xem cái video đã encode xong chưa
export const handleUploadVideoHLS = async (req: Request) => {
  const nanoId = (await import('nanoid')).nanoid
  const idName = nanoId()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 1,
    maxFileSize: 200 * 1024 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const isValid = name === 'video' && Boolean(mimetype?.includes('video/') || mimetype?.includes('quicktime'))

      if (!isValid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return isValid
    },
    filename: () => idName
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (isEmpty(files)) {
        return reject(new Error('File is empty'))
      }

      const videos = files.video as File[]

      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`)
        video.newFilename = `${video.newFilename}.${ext}`
        video.filepath = `${video.filepath}.${ext}`
      })

      resolve(files.video as File[])
    })
  })
}

export const getFiles = (dir: string, files: string[] = []) => {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}
