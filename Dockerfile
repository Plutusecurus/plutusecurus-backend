FROM node:16-alpine

# Create App Directory
WORKDIR /usr/src/app

# Install Project Dependencies
COPY package*.json ./

RUN npm install

# Copy Bundle App Source Code

COPY . .

EXPOSE 8000
CMD [ "node", "index.js" ]
