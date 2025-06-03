FROM node:23-alpine3.20 AS builder

WORKDIR /frontend

# Install project dependencies
COPY package.json package-lock.json ./

# Copy source code and config files
COPY . .

# Build the project (output in dist/)
RUN npm ci --force

# Declare the exposed port (used by vite preview)
EXPOSE 3000

# Start
CMD ["npm", "run", "dev"]