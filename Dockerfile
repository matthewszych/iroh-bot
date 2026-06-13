FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json knexfile.ts ./
COPY src/ src/
RUN npm run build

FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist dist/
COPY --from=build /app/knexfile.ts ./
COPY src/db/migrations src/db/migrations/

CMD ["node", "dist/bot.js"]
