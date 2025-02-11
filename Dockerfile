FROM node:20.9.0

# Set the working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .
