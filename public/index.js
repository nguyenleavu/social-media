"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const errors_middlewares_1 = require("./middlewares/errors.middlewares");
const bookmarks_routes_1 = __importDefault(require("./routes/bookmarks.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const like_routes_1 = __importDefault(require("./routes/like.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const static_routes_1 = __importDefault(require("./routes/static.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const database_services_1 = __importDefault(require("./services/database.services"));
const file_1 = require("./utils/file");
const socket_1 = __importDefault(require("./utils/socket"));
(0, dotenv_1.config)();
database_services_1.default.connect().then(() => {
    database_services_1.default.indexUser();
    database_services_1.default.indexRefreshToken();
    database_services_1.default.indexVideoStatus();
    database_services_1.default.indexFollowers();
    database_services_1.default.indexPosts();
});
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 4000;
// create folder
(0, file_1.initFolder)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Router
app.use('/users', users_routes_1.default);
app.use('/medias', media_routes_1.default);
app.use('/static', static_routes_1.default);
app.use('/posts', posts_routes_1.default);
app.use('/bookmarks', bookmarks_routes_1.default);
app.use('/likes', like_routes_1.default);
app.use('/search', search_routes_1.default);
app.use('/conversations', conversation_routes_1.default);
// Error handler
app.use(errors_middlewares_1.defaultErrorHandler);
// Socket IO
(0, socket_1.default)(httpServer);
// Port
httpServer.listen(PORT, () => {
    console.log(`App run at port:${PORT}`);
});
