import conversationService from '@/services/conversations.services'
import { Request, Response } from 'express'

export const getConversationsController = async (req: Request, res: Response) => {
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sender_id = req.decode_authorization?.user_id as string
  const { data, total } = await conversationService.getConversations({
    receiver_id,
    sender_id,
    limit,
    page
  })

  return res.json({
    message: 'Get conversation success',
    data,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}
