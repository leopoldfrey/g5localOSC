#!/bin/sh
echo Starting G5 PULSO OSC
cd $(dirname $0)/
node app.js "192.168.3.10" 48000 "192.168.3.11" 48001