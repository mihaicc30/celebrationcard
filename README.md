
# Gift Shop

This is a web application for an online gift shop. It allows users to browse, search, and purchase gift items. The application is built using Node.js, Express, MongoDB, EJS, and Passport.js.

## Technologies Used

-   Node.js: a JavaScript runtime built on Chrome's V8 JavaScript engine
-   Express: a web application framework for Node.js
-   MongoDB: a document-based NoSQL database
-   EJS: a template engine for generating HTML markup with JavaScript
-   Passport.js: an authentication middleware for Node.js
-   bcryptjs: a library for hashing and salting passwords
-   dotenv: a module for loading environment variables from a .env file
-   connect-flash: a middleware for displaying flash messages
-   cookie-session: a middleware for storing session data in cookies
-   express-ejs-layouts: a layout engine for EJS templates
-   express-session: a middleware for managing user sessions
-   mongoose: an object data modeling (ODM) library for MongoDB
-   multer: a middleware for handling file uploads
-   sharp: a high-performance image processing library

## How to Run the Project

### Prerequisites

Before running the project, you need to have the following software installed on your machine:

-   Node.js (v16 or later)
-   MongoDB (v4 or later)

You also need to create a `.env` file in the root directory of the project with the following environment variables:

MONGODB_URI=mongodb://localhost:27017/giftshop
SESSION_SECRET=your_session_secret_here` 

### Development

To run the project in development mode, follow these steps:

1.  Clone the repository to your local machine
2.  Open a terminal and navigate to the project directory
3.  Run `npm install` to install the dependencies
4.  Run `npm start` to start the development server
5.  Open a web browser and navigate to `http://localhost:8080`

### Production

To run the project in production mode, follow these steps:

1.  Clone the repository to your server
2.  Open a terminal and navigate to the project directory
3.  Run `npm install` to install the dependencies
4.  Set the `NODE_ENV` environment variable to `production`
5.  Set the `MONGODB_URI` environment variable to your MongoDB server URL
6.  Set the `SESSION_SECRET` environment variable to a secure session secret
7.  Run `npm start` to start the production server