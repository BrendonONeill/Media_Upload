FROM node:20.10.0-alpine

WORKDIR /app

COPY . .

RUN npm install

CMD [ "node", "src/index.js" ]