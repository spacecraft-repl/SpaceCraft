FROM mhart/alpine-node:latest
RUN mkdir -p /app
WORKDIR /app
COPY . /app

# @todo: Verify that this build process is not producing any bugs!

# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add \
    bash \
    ruby \
    ruby-irb \
    python \
    make \
    g++ \
    && npm install \
    && npm run build
    # && apk del build-dependencies

EXPOSE 3000
CMD [ "npm", "run", "debug" ]
