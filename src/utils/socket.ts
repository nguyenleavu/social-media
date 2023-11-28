import databaseServices from '@/services/database.services'
import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { verifyAccessToken } from './common'
import { ErrorWithStatus } from '@/models/Errors'
import { USER_MESSAGES } from '@/constants/messages'
import { UserVerifyStatus } from '@/constants/enums'
import HTTP_STATUS from '@/constants/httpStatus'
import { TokenPayload } from '@/models/requests/Users.requests'
import Conversation from '@/models/schemas/Conversation.schema'
import { Server as ServerHttp } from 'http'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  io.use(async (socket, next) => {
    const Authorization = socket.handshake.auth.Authorization

    const access_token = Authorization?.split(' ')[1]
    try {
      const decode_authorization = await verifyAccessToken(access_token)
      const { verify } = decode_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      socket.handshake.auth.decode_authorization = (decode_authorization as TokenPayload)._id
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorize',
        name: 'UnauthorizeError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    const { user_id } = socket.handshake.auth.decode_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }
    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorize'))
      }
    })

    socket.on('error', (err) => {
      if (err.message === 'Unauthorize') {
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data) => {
      const { receiver_id, sender_id, content } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content
      })

      const result = await databaseServices.conversations.insertOne(conversation)

      conversation._id = result.insertedId

      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation
        })
      }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
    })
  })
}

export default initSocket
