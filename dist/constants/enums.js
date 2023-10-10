"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleFollow = exports.PostAudience = exports.PostType = exports.EncodingStatus = exports.MediaTypeQuery = exports.MediaType = exports.TokenType = exports.UserVerifyStatus = void 0;
var UserVerifyStatus;
(function (UserVerifyStatus) {
    UserVerifyStatus[UserVerifyStatus["Unverified"] = 0] = "Unverified";
    UserVerifyStatus[UserVerifyStatus["Verified"] = 1] = "Verified";
    UserVerifyStatus[UserVerifyStatus["Banned"] = 2] = "Banned";
})(UserVerifyStatus || (exports.UserVerifyStatus = UserVerifyStatus = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["AccessToken"] = 0] = "AccessToken";
    TokenType[TokenType["RefreshToken"] = 1] = "RefreshToken";
    TokenType[TokenType["ForgotPasswordToken"] = 2] = "ForgotPasswordToken";
    TokenType[TokenType["EmailVerifyToken"] = 3] = "EmailVerifyToken";
})(TokenType || (exports.TokenType = TokenType = {}));
var MediaType;
(function (MediaType) {
    MediaType[MediaType["Image"] = 0] = "Image";
    MediaType[MediaType["Video"] = 1] = "Video";
    MediaType[MediaType["HLS"] = 2] = "HLS";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaTypeQuery;
(function (MediaTypeQuery) {
    MediaTypeQuery["Image"] = "image";
    MediaTypeQuery["Video"] = "video";
})(MediaTypeQuery || (exports.MediaTypeQuery = MediaTypeQuery = {}));
var EncodingStatus;
(function (EncodingStatus) {
    EncodingStatus[EncodingStatus["Pending"] = 0] = "Pending";
    EncodingStatus[EncodingStatus["Processing"] = 1] = "Processing";
    EncodingStatus[EncodingStatus["Success"] = 2] = "Success";
    EncodingStatus[EncodingStatus["Failed"] = 3] = "Failed";
})(EncodingStatus || (exports.EncodingStatus = EncodingStatus = {}));
var PostType;
(function (PostType) {
    PostType[PostType["Post"] = 0] = "Post";
    PostType[PostType["Repost"] = 1] = "Repost";
    PostType[PostType["Comment"] = 2] = "Comment";
    PostType[PostType["QuotePost"] = 3] = "QuotePost";
})(PostType || (exports.PostType = PostType = {}));
var PostAudience;
(function (PostAudience) {
    PostAudience[PostAudience["Everyone"] = 0] = "Everyone";
    PostAudience[PostAudience["PostCircle"] = 1] = "PostCircle";
})(PostAudience || (exports.PostAudience = PostAudience = {}));
var PeopleFollow;
(function (PeopleFollow) {
    PeopleFollow["Anyone"] = "0";
    PeopleFollow["Following"] = "1";
})(PeopleFollow || (exports.PeopleFollow = PeopleFollow = {}));
