"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIKE_MESSAGE = exports.BOOKMARK_MESSAGE = exports.POST_MESSAGE = exports.USER_MESSAGES = void 0;
exports.USER_MESSAGES = {
    VALIDATION_ERROR: 'Validation error',
    NAME_IS_REQUIRED: 'Name is required',
    NAME_MUST_BE_A_STRING: 'Name must be a string',
    NAME_MUST_BE_FROM_6_TO_255: 'Name length must be from 6 to 255',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    EMAIL_IS_REQUIRED: 'Email is required',
    EMAIL_IS_INVALID: 'Email is invalid',
    EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
    PASSWORD_IS_REQUIRED: 'Password is required',
    PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
    PASSWORD_MUST_BE_FROM_8_TO_255: 'Password length must be from 8 to 255',
    PASSWORD_MUST_BE_STRONG: 'Password must be 8-255 characters long and contain at least 1 lowercase letter,1 uppercase letter,1 number,and 1 symbol',
    NEW_PASSWORD_IS_REQUIRED: 'New password is required',
    NEW_PASSWORD_MUST_BE_A_STRING: 'New password must be a string',
    CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
    CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
    CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_255: 'Confirm password length must be from 8 to 255',
    CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must be 8-255 characters long and contain at least 1 lowercase letter,1 uppercase letter,1 number,and 1 symbol',
    CONFIRM_PASSWORD_DOES_NOT_MATCH: 'Confirm password does not match password',
    DATE_OF_BIRTH_MUST_BE_ISO_DATE: 'Date of birth must be iso date',
    LOGIN_SUCCESS: 'Login success',
    REGISTER_SUCCESS: 'Register success',
    ACCESS_TOKEN_IS_INVALID: 'AccessToken is invalid',
    ACCESS_TOKEN_IS_REQUIRED: 'AccessToken is required',
    REFRESH_ACCESS_TOKEN_IS_REQUIRED: 'RefreshToken is required',
    REFRESH_ACCESS_TOKEN_MUST_BE_A_STRING: 'RefreshToken must be a string',
    REFRESH_ACCESS_TOKEN_IS_INVALID: 'RefreshToken is invalid',
    REFRESH_TOKEN_DOES_NOT_EXISTS: 'RefreshToken does not exists',
    LOGOUT_SUCCESS: 'Logout success',
    EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
    EMAIL_VERIFY_SUCCESS: 'Email verify success',
    RESEND_EMAIL_VERIFY_TOKEN_SUCCESS: 'Resend email verify token success',
    CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
    FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
    FORGOT_PASSWORD_TOKEN_VERIFY_SUCCESS: 'Forgot password token verify success',
    FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
    RESET_PASSWORD_SUCCESS: 'Reset password success',
    GET_MET_SUCCESS: 'Get me success',
    USER_NOT_VERIFIED: 'User not verified',
    BIO_MUST_BE_A_STRING: 'Bio must be a string',
    BIO_MUST_BE_FROM_1_TO_2000: 'Bio must be from 1 to 2000',
    LOCATION_MUST_BE_A_STRING: 'Location must be a string',
    LOCATION_MUST_BE_FROM_1_TO_255: 'Location must be from 1 to 255',
    WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
    WEBSITE_MUST_BE_FROM_1_TO_255: 'Website must be from 1 to 255',
    USERNAME_MUST_BE_A_STRING: 'Username must be a string',
    USERNAME_MUST_BE_FROM_6_TO_255: 'Username must be from 6 to 255',
    AVATAR_MUST_BE_A_STRING: 'Avatar must be a string',
    USERNAME_IS_INVALID: 'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only number',
    USERNAME_ALREADY_USED: 'Username already used',
    AVATAR_MUST_BE_FROM_1_TO_255: 'Avatar must be from 1 to 255',
    COVER_PHOTO_MUST_BE_A_STRING: 'Cover photo must be a string',
    COVER_PHOTO_MUST_BE_FROM_1_TO_255: 'Cover photo must be from 1 to 255',
    UPDATE_ME_SUCCESS: 'Update me success',
    GET_PROFILE_SUCCESS: 'Get profile success',
    FOLLOW_SUCCESS: 'Follow success',
    INVALID_USER_ID: 'Invalid followed user id',
    FOLLOWED: 'Followed',
    ALREADY_UN_FOLLOWED: 'Already unfollowed',
    UN_FOLLOW_SUCCESS: 'Unfollow success',
    OLD_PASSWORD_NOT_MATCH: 'Old password does not match',
    CHANGE_PASSWORD_SUCCESS: 'Change password success',
    GMAIL_NOT_VERIFY: 'Gmail does not verified',
    UPLOAD_IMAGE_SUCCESS: 'Upload image successfully',
    UPLOAD_VIDEO_SUCCESS: 'Upload image successfully',
    REFRESH_TOKEN_SUCCESS: 'Refresh token success',
    GET_VIDEO_STATUS_SUCCESS: 'Get video status success'
};
exports.POST_MESSAGE = {
    INVALID_TYPE: 'Invalid type',
    INVALID_AUDIENCE: 'Invalid audience',
    INVALID_PARENT_ID: 'Invalid parent_id',
    PARENT_ID_MUST_BE_NULL: 'Parent_id must be null',
    CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non empty string',
    CONTENT_MUST_BE_A_EMPTY_STRING: 'Content must a be empty string',
    HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
    MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user_id',
    MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
    INVALID_POST_ID: 'Invalid post id',
    POST_NOT_FOUND: 'Post not found',
    CREATE_POST_SUCCESS: 'Create post success',
    GET_POST_SUCCESS: 'Get post success',
    POST_IS_NOT_PUBLIC: 'Post is not public',
    GET_POST_CHILDREN_SUCCESS: 'Get post children success',
    GET_NEWS_FEEDS_SUCCESS: 'Get new feeds success',
    GET_MEDIAS_SUCCESS: 'Get medias success'
};
exports.BOOKMARK_MESSAGE = {
    BOOKMARK_SUCCESS: 'Bookmark success',
    UNBOOKMARK_SUCCESS: 'Unbookmark success'
};
exports.LIKE_MESSAGE = {
    LIKE_POST_SUCCESS: 'Like post success',
    UNLIKE_POST_SUCCESS: 'Unlike post success'
};
