#!/usr/bin/env bash
npm install
export NODE_ENV=production
pm2 start ./bin/www --no-daemon --name mms -i max