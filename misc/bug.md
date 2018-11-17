# Hanging bug

## Possible Causes
- node version
- operating system
  - droplet
  - container
  - local
- npm
- webpack
- socket.io
- browser
- xterm
- node-pty


## Ideas

socat(1) manpage:
  > For addresses that work on a tty (e.g., stdio, file:/dev/tty, exec:...,pty), the  termi‐
  > nal  parameters  defined  in  the  UNIX  termios mechanism are made available as address
  > option parameters.  Please note that changes of the parameters of your interactive  ter‐
  > minal  remain effective after socat’s termination, so you might have to enter "reset" or
  > "stty sane" in your shell afterwards.  For EXEC and SYSTEM addresses  with  option  PTY,
  > these options apply to the pty by the child processes.
