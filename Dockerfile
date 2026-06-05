FROM node:22-alpine

WORKDIR /app

COPY package.json server.js ./
COPY public/ ./public/

RUN mkdir -p data

ENV PORT=80

EXPOSE 80

CMD ["node", "server.js"]
