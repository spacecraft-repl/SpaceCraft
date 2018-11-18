![spacecraft-logo](https://i.imgur.com/f9RQ9GC.png)
## SpaceCraft
An open-source, real-time, collaborative REPL (Read-Eval-Print Loop) and code editor.

Currently, there are several existing solutions in this problem domain that attempt to allow developers to easily try out unfamiliar languages and provide a REPL-like experience. However, each of these solutions has made decisions that limit their ability to provide a comprehensive experience for developers. Repl.it, for example, does not allow real-time collaboration between users. Furthermore, Coderpad.io, requires sign-up and only provides a 30-minute demo environment. Our team wants to create a free open-source alternative that developers can use to explore different languages through a collaborative REPL and code editor.

We currently limit our support to three main languages: Ruby, JavaScript and Python. More languages may be added in the future.

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

*Note: in order for Ruby and Python REPLsto run properly, you need to have those runtimes installed in your system.*

