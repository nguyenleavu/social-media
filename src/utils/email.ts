import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config()

// Create SES service object.
const sesClient = new SESClient({
  region: process.env.NODE_AWS_REGION,
  credentials: {
    secretAccessKey: process.env.NODE_AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.NODE_AWS_ACCESS_KEY_ID as string
  }
})

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf-8')

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

export const sendVerifyRegisterEmail = (
  toAddress: string,
  email_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'VERIFY_YOUR_EMAIL',
    template
      .replace('{{title}}', 'VERIFY YOUR EMAIL')
      .replace('{{content}}', 'Click button below to verify email')
      .replace('{{button}}', 'Verify your email')
      .replace('{{link}}', `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`)
  )
}

export const sendForgotPasswordEmail = (
  toAddress: string,
  forgot_password_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'FORGOT_PASSWORD',
    template
      .replace('{{title}}', 'FORGOT PASSWORD')
      .replace('{{content}}', 'Click button below to verify email')
      .replace('{{button}}', 'Reset password')
      .replace('{{link}}', `${process.env.CLIENT_URL}/verify-forgot-password?token=${forgot_password_token}`)
  )
}
