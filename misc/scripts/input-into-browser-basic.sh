#!/bin/bash

# Basic: might not work for sure, but doesn't send any random chars or open newtab

while true; do
  xdotool search --onlyvisible --name "@dev" windowfocus key "1+Return+1+2+Return+1+2+3+Return" 
  sleep 1
done
