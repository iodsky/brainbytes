# Specify node runtime as base image
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory in the container
WORKDIR /src

# Copy dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy rest of the source code
COPY . .

# Expose the port your app listens on
EXPOSE 8000

# Define command to run the app
CMD ["pnpm", "start"]