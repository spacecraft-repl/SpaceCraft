# Use phusion/baseimage as base image. To make your builds reproducible, make
# sure you lock down to a specific version, not to `latest`!
# See https://github.com/phusion/baseimage-docker/blob/master/Changelog.md for
# a list of version numbers.
FROM phusion/baseimage:0.11
RUN useradd -ms /bin/false newuser

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
# ...put your own build instructions here... #
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
RUN mkdir -p /app
WORKDIR /app
COPY . /app

# @todo: Verify that this build process is not producing any bugs!
RUN install_clean \
    make \
    g++ \
    ruby \
    npm \
    nodejs \
    python \
    && npm install \
    && npm run build

EXPOSE 3000

USER newuser
# Uncomment for regular server.
CMD ["node", "server.js"]

# Uncomment for debugging/logs.
# CMD [ "npm", "run", "debug" ]

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#   Clean up APT when done.    #
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
# USER root                    # If this is run, user assumes root within the application
# RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
