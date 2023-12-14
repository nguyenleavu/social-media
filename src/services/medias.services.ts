import { isProduction } from '@/constants/config'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/constants/dir'
import { EncodingStatus, MediaType } from '@/constants/enums'
import { Media } from '@/models/Other'
import VideoStatus from '@/models/schemas/VideoStatus.schema'
import { getFiles, getNameFromFullName, handleUploadImage, handleUploadVideo, handleUploadVideoHLS } from '@/utils/file'
import { uploadFileToS3 } from '@/utils/s3'
import { cropVideoWithProgress, encodeHLSWithMultipleVideoStreams } from '@/utils/video'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { Request } from 'express'
import fsPromise, { readFile } from 'fs/promises'
import { map } from 'lodash'
import mime from 'mime'
import path from 'path'
import sharp from 'sharp'
import databaseServices from './database.services'
import { rimrafSync } from 'rimraf'
import { readFileSync } from 'fs'

config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    const idName = getNameFromFullName(item.split(`\\`).pop() as string)
    await databaseServices.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullName(videoPath.split('\\').pop() as string)
      await databaseServices.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await Promise.all(
          map(files, (filepath) => {
            const fileName = 'video-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '').replace('\\', '')
            return uploadFileToS3({
              filePath: filepath,
              fileName,
              contentType: mime.getType(filepath) as string
            })
          })
        )
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await databaseServices.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              created_at: true,
              updated_at: true
            }
          }
        )
      } catch (error) {
        await databaseServices.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                created_at: true,
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.log('Update video status error', err)
          })
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log(`Encode video queue is empty`)
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const data: Media[] = await Promise.all(
      map(files, async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const fileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, fileName)
        await sharp(file.filepath).jpeg().toFile(newPath)

        const result = await uploadFileToS3({
          fileName: 'images/' + fileName,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: (result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )

    return data
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const data: Media[] = await Promise.all(
      files.map(async (file) => {
        const result = await uploadFileToS3({
          fileName: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filePath: file.filepath
        })
        fsPromise.unlink(file.filepath)
        return {
          url: (result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )

    return data
  }

  async cropVideo(req: Request, height: number, width: number, x: number, y: number) {
    const files = await handleUploadVideo(req)
    await cropVideoWithProgress(files[0].filepath, width, height, x, y)
    const filePath = path.resolve(UPLOAD_VIDEO_DIR, 'output.mp4')
    const result = await uploadFileToS3({
      fileName: 'videos/' + files[0].newFilename,
      contentType: mime.getType(filePath) as string,
      filePath: filePath
    })
    fsPromise.unlink(files[0].filepath)
    fsPromise.unlink(filePath)
    return {
      url: (result as CompleteMultipartUploadCommandOutput).Location as string,
      type: MediaType.Video
    }
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideoHLS(req)
    const data: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: `${process.env.HOST}/static/video-hls/${newFilename}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )

    return data
  }

  async getVideoStatus(id: string) {
    const data = await databaseServices.videoStatus.findOne({ name: id })
    return data
  }
}

const mediasService = new MediasService()

export default mediasService
