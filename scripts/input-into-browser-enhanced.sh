#!/bin/bash

# Enhanced: Works for sure, but sometimes sends random chars or opens newtab, so requires manual intervention

while true; do
  # Uncomment for extra power
  # xdotool search --onlyvisible --name "@dev" windowfocus key "1+Return+1+2+Return+1+2+3+Return" 

  xdotool search --onlyvisible --name "@dev" windowfocus key "Return+2+2+Return+3+3+3+Return+1+2+3+Return+Return" 

  sleep 1
done
