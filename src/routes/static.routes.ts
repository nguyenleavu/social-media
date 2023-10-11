import {
  serverImageController,
  serverM3U8controller,
  serverSegmentController,
  serverVideoStreamController
} from '@/controllers/medias.controllers'
import { Router } from 'express'

const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video/:name', serverVideoStreamController)
staticRouter.get('/video-hls/:id/master.m3u8', serverM3U8controller)
staticRouter.get('/video-hls/:id/:v/:segment', serverSegmentController)

export default staticRouter
