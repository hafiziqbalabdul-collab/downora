FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PORT=3000
ENV YTDLP_PATH=/opt/yt-dlp/bin/yt-dlp

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    ffmpeg \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/yt-dlp \
    && /opt/yt-dlp/bin/pip install --no-cache-dir --upgrade pip yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /tmp/downora \
    && chown -R node:node /app /tmp/downora

USER node

EXPOSE 3000

CMD ["npm", "start"]
