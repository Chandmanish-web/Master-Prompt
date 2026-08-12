FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --production

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 5000

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "const http = require('http'); const req = http.get('http://127.0.0.1:5000/api/health', res => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1));"

CMD ["npm", "start"]
