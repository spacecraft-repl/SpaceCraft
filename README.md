[![spacecraft-logo](https://i.imgur.com/f9RQ9GC.png)](https://spacecraft-repl.com)
## Overview
[SpaceCraft](https://spacecraft-repl.com) is an open-source, real-time, collaborative REPL (Read-Eval-Print Loop) that runs in the browser.

Currently, there are several existing solutions in this problem domain that attempt to allow developers to easily try out unfamiliar languages and provide a REPL-like experience. However, each of these solutions has made decisions that limit their ability to provide a comprehensive experience for developers. Coderpad.io, for example, requires sign-up and only provides a 30-minute demo environment. Repl.it recently announced the launch of its collaborative feature, however it is closed source and requires sign-up. Our team wants to create a free open-source alternative that developers can deploy on their own and use it to explore different languages through a collaborative REPL and code editor.

We currently limit our support to three main languages: Ruby, JavaScript and Python. More languages may be added in the future.

## Case Study
[Learn more about our project here](https://spacecraft-repl.com/whitepaper), including the challenges we solved by implementing containers, pseudo-terminals, input synchronization, and a reverse proxy.

## The Team
![gooi](https://i.imgur.com/lBvHH9j.jpg?2)

**[Ying Chyi Gooi](https://gooi.tech) - New York City, NY**

![nick](https://i.imgur.com/2atacXb.jpg?2)

**[Nick Johnson](https://njohnson7.github.io) - San Francisco, CA**

![julius](https://i.imgur.com/FUQCN67.jpg?2)

**[Julius Zerwick](https://rouxcaesar.github.io/) - New York City, NY**


## Deploying with Heroku
Make sure that you are signed-in to Heroku in your browser, then deploy using the one-click button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

*Note: this will deploy the latest `master` branch from this repository.*

## Local Setup
Make sure you have Node.js installed. Then, run:

```
npm install
```

Once the dependencies are installed, run:

```
npm start
```

Navigate to `http://localhost:3000/` to start the app.

*Note: in order for Ruby and Python REPLs to run properly, you need to have those runtimes installed in your system.*

## Deploying with Docker
Make sure you have Docker installed in your host system. Then, clone this repository, navigate to the root path of the project folder, and then run:

```
docker build -t spacecraft-app .
```
Note: `spacecraft-app` can be replaced by a name of your choice.

Once Docker is finished with building the image, run the following command to verify that `spacecraft-app` exists and has been built successfully.

```
docker images
```
If the build succeeds, execute the following command to launch the application:

```
docker run -p 80:3000 -d spacecraft-app
```
Once that is done, navigate to `localhost` to view the app. If running on a remote host however, you'll need to request the remote host IP in order to connect with the app. 

For remote host only: if there's issues with connecting to the app, make sure to check your remote host's firewall settings to allow port 80 to be accessible. Example: `ufw allow 80`


