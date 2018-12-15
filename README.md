![spacecraft-logo](https://i.imgur.com/f9RQ9GC.png)
## SpaceCraft
An open-source, real-time, collaborative REPL (Read-Eval-Print Loop) and code editor.

Currently, there are several existing solutions in this problem domain that attempt to allow developers to easily try out unfamiliar languages and provide a REPL-like experience. However, each of these solutions has made decisions that limit their ability to provide a comprehensive experience for developers. Repl.it, for example, does not allow real-time collaboration between users. Furthermore, Coderpad.io, requires sign-up and only provides a 30-minute demo environment. Our team wants to create a free open-source alternative that developers can use to explore different languages through a collaborative REPL and code editor.

We currently limit our support to three main languages: Ruby, JavaScript and Python. More languages may be added in the future.

## Case Study
Learn more about our project [here](https://spacecraft-repl.github.io/), including the challenges we solved by implementing containers, pseudo-terminals, input synchronization, and a reverse proxy.

## Deploying with Heroku
Make sure you are signed-in to Heroku in your browser, then deploy using the one-click app below:
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

## The Team
Ying Chyi Gooi
_Software Engineer_
New York City, NY

Nick Johnson
_Software Engineer_
New York City, NY

Julius Zerwick
_Software Engineer_
San Francisco, CA

## Deploying with Docker
Make sure you have Docker installed in your host system. Then, clone this repository, navigate to the root path of the project folder, and then run:

```
docker built -t spacecraft-app .
```
Note: `spacecraft-app` can be replaced by any name of your choice.

Once Docker is finished with building the image, run the following command to verify that `spacecraft-app` exists and has been built successfully.

```
docker images
```
If the build succeeds, run to following to launch the application:

```
docker run -p 3000:3000 -d spacecraft-app
```
Once that is done, navigate to `localhost:3000` to view the app. If running on a remote host however, you'll need to request `<remote host IP OR domain name>:3000` in order to connect with the app.


