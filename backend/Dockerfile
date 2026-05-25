FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm install typescript && npm run build && npm prune --omit=dev

RUN mkdir -p /app/storage /app/outputs /app/uploads

ENV PORT=3001
ENV NODE_ENV=production
ENV STORAGE_ROOT=/app/storage
ENV OUTPUTS_ROOT=/app/outputs
ENV UPLOADS_ROOT=/app/uploads

EXPOSE 3001

CMD ["node", "dist/index.js"]
