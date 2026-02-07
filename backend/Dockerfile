FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
