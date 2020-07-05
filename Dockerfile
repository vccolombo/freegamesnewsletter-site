FROM node:12-buster-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]