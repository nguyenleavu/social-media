export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}

export enum PostType {
  Post,
  Repost,
  Comment,
  QuotePost
}

export enum PostAudience {
  Everyone,
  PostCircle
}

export enum PeopleFollow {
  Anyone = '0',
  Following = '1'
}
