"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendForgotPasswordEmail = exports.sendVerifyRegisterEmail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
// Create SES service object.
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
    }
});
const verifyEmailTemplate = fs_1.default.readFileSync(path_1.default.resolve('src/templates/verify-email.html'), 'utf-8');
const createSendEmailCommand = ({ fromAddress, toAddresses, ccAddresses = [], body, subject, replyToAddresses = [] }) => {
    return new client_ses_1.SendEmailCommand({
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
    });
};
const sendVerifyEmail = (toAddress, subject, body) => {
    const sendEmailCommand = createSendEmailCommand({
        fromAddress: process.env.SES_FROM_ADDRESS,
        toAddresses: toAddress,
        body,
        subject
    });
    return sesClient.send(sendEmailCommand);
};
const sendVerifyRegisterEmail = (toAddress, email_verify_token, template = verifyEmailTemplate) => {
    return sendVerifyEmail(toAddress, 'VERIFY_YOUR_EMAIL', template
        .replace('{{title}}', 'VERIFY YOUR EMAIL')
        .replace('{{content}}', 'Click button below to verify email')
        .replace('{{button}}', 'Verify your email')
        .replace('{{link}}', `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`));
};
exports.sendVerifyRegisterEmail = sendVerifyRegisterEmail;
const sendForgotPasswordEmail = (toAddress, forgot_password_token, template = verifyEmailTemplate) => {
    return sendVerifyEmail(toAddress, 'FORGOT_PASSWORD', template
        .replace('{{title}}', 'FORGOT PASSWORD')
        .replace('{{content}}', 'Click button below to verify email')
        .replace('{{button}}', 'Reset password')
        .replace('{{link}}', `${process.env.CLIENT_URL}/verify-forgot-password?token=${forgot_password_token}`));
};
exports.sendForgotPasswordEmail = sendForgotPasswordEmail;
