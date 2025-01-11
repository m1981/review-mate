FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Specify the command to run your app
CMD ["npm", "start"]
