FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json vitest.config.ts ./
COPY src ./src
COPY tests ./tests

RUN npm run build

EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:migrate && npm run seed && npm run start"]
