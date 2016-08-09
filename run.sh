#!/usr/bin/env bash
#切换镜像为淘宝npm
npm config set registry https://registry.npm.taobao.org
npm install
export NODE_ENV=production
pm2 start ./bin/www --no-daemon --name mms -i max  >> /opt/nodejs/data/test.log 2>&1