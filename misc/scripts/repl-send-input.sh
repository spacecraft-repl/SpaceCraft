#!/bin/bash

# Focus Chrome window and send a sequence of keystrokes every 500ms.
# To exit, use Ctrl-c in terminal.

echo 'Starting keystroke input to Chrome... Type Ctrl-C to exit.'

while true; do
  xdotool \
    search \
      --onlyvisible \
      --name "Chrome" \
    windowactivate \
    key \
      --delay 12 \
      --clearmodifiers \
      Return 0 Return 1 2 Return 3 4 5 Return 6 7 8 9 Return \
    sleep 0.175
done
