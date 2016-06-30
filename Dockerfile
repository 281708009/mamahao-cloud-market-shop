###############1
#FROM ubuntu
#
#COPY . /src
#
##RUN
#RUN    apt-get update
#RUN    apt-get install -y wget python gcc make g++
#WORKDIR    /tmp
#RUN    wget http://nodejs.org/dist/latest-v4.x/node-v4.4.5.tar.gz
#RUN    tar -zxvf node-v4.4.5.tar.gz
#WORKDIR     node-v4.4.5
#RUN    pwd
#RUN    ./configure
#RUN    make install
#RUN    node -v
#WORKDIR     /src
#RUN    npm install
#
#CMD ["node", "/src/bin/www"]
#
#EXPOSE  3000

#############2
#FROM node:argon
#
## 创建应用目录
#RUN mkdir -p /usr/src/app
#WORKDIR /usr/src/app
#
## 安装依赖
#COPY package.json /usr/src/app/
#RUN npm install
#
## 拷贝代码
#COPY . /usr/src/app
#
#EXPOSE 3000
#CMD [ "npm", "start" ]

#############3
FROM mamahao/nodejs:4.4.5

# 创建应用目录
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/logs/mms

WORKDIR /usr/src/app

# 安装依赖
COPY package.json /usr/src/app/
RUN npm install -g
RUN npm install pm2  -g

# 拷贝代码
COPY . /usr/src/app

EXPOSE 3000
CMD [ "sh", "run.sh" ]