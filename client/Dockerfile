# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Production stage - lightweight app server
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4173

# Use preview instead of dev server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
