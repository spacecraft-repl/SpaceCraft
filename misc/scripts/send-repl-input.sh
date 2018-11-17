#!/bin/bash

# Basic: might not work for sure, but doesn't send any random chars or open newtab

while true; do
  xdotool search --onlyvisible --name "Chrome" windowfocus key --delay 30 Return 0 Return 1 2 Return 3 4 5 Return 6 7 8 9 Return
  /usr/bin/env sleep 0.5
done

