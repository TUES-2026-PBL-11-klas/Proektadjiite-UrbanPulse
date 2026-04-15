FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY docker ./docker

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["sh", "./docker/entrypoint.sh"]
