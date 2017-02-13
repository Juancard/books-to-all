# Voting App!

## Overview

Here are the specific user stories implemented for this project:
- User Story: I can view all books posted by every user.
- User Story: I can add a new book.
- User Story: I can update my settings to store my full name, city, and state.
- User Story: I can propose a trade and wait for the other user to accept the trade.

# Quick Start Guide

### Prerequisites

In order to use books-to-all, you must have the following installed:

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- [MongoDB](http://www.mongodb.org/)
- [Git](https://git-scm.com/)

### Installation & Startup

To install this app, simply enter the below in the terminal window:

```bash
$ git clone https://github.com/Juancard/books-to-all your-project
```

To install the dependencies, enter the following in your terminal:

```
$ cd your-project
$ npm install
```

This will install the books-to-all components into the `your-project` directory.

### Local Environment Variables

Create a file named `.env` in the root directory. This file should contain:

```
TWITTER_KEY=your-client-id-here
TWITTER_SECRET=your-client-secret-here
MONGO_URI=mongodb://localhost:27017/books-to-all
PORT=8080
APP_URL=http://localhost:8080/
```

### Starting the App

To start the app, make sure you're in the project directory and type `node server.js` into the terminal. This will start the Node server and connect to MongoDB.

You should the following messages within the terminal window:

```
Node.js listening on port 8080...
```

Next, open your browser and enter `http://localhost:8080/`. Congrats, you're up and running!

## License

MIT License. [Click here for more information.](LICENSE.md)
