FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

COPY package.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 3000

CMD ["npm", "run", "start:docker"]
