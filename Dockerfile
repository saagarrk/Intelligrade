# syntax=docker/dockerfile:1
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci || npm install

# Copy full source tree (both backend server.ts and frontend src/)
COPY . .

# Build both frontend and bundle backend into dist/server.cjs
RUN npm run build

# Production runtime
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

CMD ["node", "dist/server.cjs"]

