# Use official Bun image
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package.json ./
COPY bun.lockb* ./

# Install only production dependencies
RUN bun install --production

# Copy source code
COPY src ./src
COPY tsconfig.json ./
COPY config.json ./

# Expose load balancer port
EXPOSE 7000

# Start the load balancer
CMD ["bun", "run", "src/index.ts"]
