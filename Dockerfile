FROM node:20.15-alpine

WORKDIR /application

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . .

#RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]