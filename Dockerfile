FROM ubuntu:18.04
ENV BUILD_DATE=08_09_2018
ENV TERM=xterm
RUN apt-get update
RUN apt-get install -y software-properties-common curl sudo
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN apt-get install -y nodejs git git-core gcc make build-essential
RUN npm install -g jest typescript@3.0.3

RUN apt-get update

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . /application
WORKDIR /application
RUN tsc -p tsconfig.json

CMD ["npm", "run", "start"]
