# Use the official Node.js 16 image as the base image
FROM node:23-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the API will run on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "--env-file=.env index.js"]