import databaseServices from '@/services/database.services'
import cors, { CorsOptions } from 'cors'
import { config } from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import bookmarksRouter from './routes/bookmarks.routes'
import conversationRouter from './routes/conversation.routes'
import likesRouter from './routes/like.routes'
import mediasRouter from './routes/media.routes'
import postsRouter from './routes/posts.routes'
import searchRouter from './routes/search.routes'
import staticRouter from './routes/static.routes'
import usersRouter from './routes/users.routes'
import { initFolder } from './utils/file'
import initSocket from './utils/socket'
import helmet from 'helmet'

config()

databaseServices.connect().then(() => {
  databaseServices.indexUser()
  databaseServices.indexRefreshToken()
  databaseServices.indexVideoStatus()
  databaseServices.indexFollowers()
  databaseServices.indexPosts()
})
const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 4000

// create folder
initFolder()

app.use(
  cors({
    origin: '*'
  })
)
app.use(helmet())
app.use(express.json())

// Router
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/posts', postsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationRouter)

// Error handler
app.use(defaultErrorHandler)

// Socket IO
initSocket(httpServer)

// Port
httpServer.listen(PORT, () => {
  console.log(`App run at port:${PORT}`)
})
