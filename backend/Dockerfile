# Stage 1: "builder" - Build the production-ready code
# We use a specific Node version
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all our source code (.ts files)
COPY . .

# Copy the generated Prisma client
COPY prisma ./prisma

# Build the app (transpile .ts to .js)
RUN npm run build

# ---

# Stage 2: "development" - The target we use in docker-compose
# This is our hot-reloading, dev-only environment
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copy the "node_modules" from the builder stage
# This is faster than running "npm install" again
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

# This image will be started by docker-compose with the
# "npm run start:debug" command
CMD [ "npm", "run", "start:debug" ]