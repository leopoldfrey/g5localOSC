#!/bin/sh
echo Starting G5 LOCAL OSC
cd $(dirname $0)/
node app.js "127.0.0.1" 48000 "127.0.0.1" 48001