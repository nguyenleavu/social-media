FROM node:20-alpine3.16

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .env .
COPY ./src ./src

RUN apk update && apk add bash
RUN apk add --no-cache ffmpeg
RUN apk add python3
RUN yarn install
RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
