FROM n8nio/n8n:latest

USER root

RUN apk update && \
    apk add --no-cache ffmpeg ffprobe && \
    rm -rf /var/cache/apk/*

USER node

WORKDIR /usr/local/lib/node_modules/n8n
