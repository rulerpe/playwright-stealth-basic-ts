# Use Playwright v1.50.0 with noble (Ubuntu 24.04)
FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Railway uses port 3000 by default
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
