FROM node:18-alpine

USER node
ENV PORT=1234
WORKDIR /app
COPY httpServer.mjs /app

EXPOSE 1234

CMD node /app/httpServer.mjs
