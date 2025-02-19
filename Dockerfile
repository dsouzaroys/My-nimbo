# Use the node:18.7.0-alpine base image
FROM node:18.7.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the API code into the container
COPY . .

# Expose the port that the API will run on
EXPOSE 5000

# Start the API server
CMD ["npm", "start"]
