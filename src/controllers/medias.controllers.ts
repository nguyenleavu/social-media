import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/constants/dir'
import HTTP_STATUS from '@/constants/httpStatus'
import { USER_MESSAGES } from '@/constants/messages'
import mediasService from '@/services/medias.services'
import { sendFileToS3 } from '@/utils/s3'
import { Request, Response } from 'express'
import fs from 'fs'
import { isEmpty } from 'lodash'
import mime from 'mime'
import path from 'path'

export const uploadImageController = async (req: Request, res: Response) => {
  const data = await mediasService.uploadImage(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_IMAGE_SUCCESS, data })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const data = await mediasService.uploadVideo(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_VIDEO_SUCCESS, data })
}

export const cropVideoController = async (req: Request, res: Response) => {
  const width = Number(req.query.width)
  const height = Number(req.query.height)
  const x = Number(req.query.x)
  const y = Number(req.query.y)
  const data = await mediasService.cropVideo(req, height, width, x, y)
  return res.json({ message: USER_MESSAGES.UPLOAD_VIDEO_SUCCESS, data })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const data = await mediasService.uploadVideoHLS(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_VIDEO_SUCCESS, data })
}

export const serverImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serverVideoStreamController = (req: Request, res: Response) => {
  const range = req.headers.range

  if (isEmpty(range)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires range header')
  }

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // Tính theo hệ thập phân :  1MB = 10^6 bytes
  // Tính theo hệ nhị phân :  1MB = 2^20 bytes

  // Dung lượng video
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mội phân đoạn stream
  const chunkSize = 10 ** 6 //1MB
  // Lấy giá trị byte bắt đầu từ header Range
  const start = Number((range as string).replace(/\D/g, ''))
  // Lấy giá trị byte kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  // Thường đây sẽ là chunkSize , ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  fs.createReadStream(videoPath, { start, end }).pipe(res)
}

export const serverM3U8controller = (req: Request, res: Response) => {
  const { id } = req.params
  sendFileToS3(res, `video-hls/${id}/master.m3u8`)
}

export const serverSegmentController = (req: Request, res: Response) => {
  const { id, v, segment } = req.params
  sendFileToS3(res, `video-hls/${id}/${v}/${segment}`)
}

export const videoStatusController = async (req: Request, res: Response) => {
  const { id } = req.params
  const data = await mediasService.getVideoStatus(id)
  return res.json({ message: USER_MESSAGES.GET_VIDEO_STATUS_SUCCESS, data })
}
