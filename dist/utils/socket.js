"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_services_1 = __importDefault(require("../services/database.services"));
const mongodb_1 = require("mongodb");
const socket_io_1 = require("socket.io");
const common_1 = require("./common");
const Errors_1 = require("../models/Errors");
const messages_1 = require("../constants/messages");
const enums_1 = require("../constants/enums");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const Conversation_schema_1 = __importDefault(require("../models/schemas/Conversation.schema"));
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: 'http://localhost:3000'
        }
    });
    const users = {};
    io.use(async (socket, next) => {
        const Authorization = socket.handshake.auth.Authorization;
        const access_token = Authorization?.split(' ')[1];
        try {
            const decode_authorization = await (0, common_1.verifyAccessToken)(access_token);
            const { verify } = decode_authorization;
            if (verify !== enums_1.UserVerifyStatus.Verified) {
                throw new Errors_1.ErrorWithStatus({
                    message: messages_1.USER_MESSAGES.USER_NOT_VERIFIED,
                    status: httpStatus_1.default.FORBIDDEN
                });
            }
            socket.handshake.auth.decode_authorization = decode_authorization._id;
            socket.handshake.auth.access_token = access_token;
            next();
        }
        catch (error) {
            next({
                message: 'Unauthorize',
                name: 'UnauthorizeError',
                data: error
            });
        }
    });
    io.on('connection', (socket) => {
        const { user_id } = socket.handshake.auth.decode_authorization;
        users[user_id] = {
            socket_id: socket.id
        };
        socket.use(async (packet, next) => {
            const { access_token } = socket.handshake.auth;
            try {
                await (0, common_1.verifyAccessToken)(access_token);
                next();
            }
            catch (error) {
                next(new Error('Unauthorize'));
            }
        });
        socket.on('error', (err) => {
            if (err.message === 'Unauthorize') {
                socket.disconnect();
            }
        });
        socket.on('send_message', async (data) => {
            const { receiver_id, sender_id, content } = data.payload;
            const receiver_socket_id = users[receiver_id]?.socket_id;
            const conversation = new Conversation_schema_1.default({
                sender_id: new mongodb_1.ObjectId(sender_id),
                receiver_id: new mongodb_1.ObjectId(receiver_id),
                content: content
            });
            const result = await database_services_1.default.conversations.insertOne(conversation);
            conversation._id = result.insertedId;
            if (receiver_socket_id) {
                socket.to(receiver_socket_id).emit('receive_message', {
                    payload: conversation
                });
            }
        });
        socket.on('disconnect', () => {
            delete users[user_id];
        });
    });
};
exports.default = initSocket;
