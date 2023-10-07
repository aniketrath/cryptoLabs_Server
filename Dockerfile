FROM node:20-alpine

WORKDIR /server

COPY ./package*.json ./

RUN npm install -g nodemon

RUN npm i

COPY . .

EXPOSE 5000

CMD ["npm","run","dev"]