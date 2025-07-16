# Use a Debian-based Node.js image to support Java installation
FROM node:20-bullseye

# Install Java (required for Audiveris)
RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy only package files first to optimize Docker caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy remaining application code, including TypeScript source and Audiveris files
COPY . .

# Optional: explicitly set env vars if used in code
ENV NODE_ENV=production
ENV PORT=8080

# Build the TypeScript project
RUN npm run build

# Expose the Express server port
EXPOSE 8080

# Run the compiled Express server (make sure lib/index.js exists after build)
CMD ["node", "lib/index.js"]

