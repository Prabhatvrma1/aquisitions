FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production dependencies builder stage
FROM base AS prod-deps
RUN npm ci --omit=dev

# Production runner stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
# Keep only necessary runtime files to keep image size small
EXPOSE 3000
CMD ["node", "src/index.js"]
