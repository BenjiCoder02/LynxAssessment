# Product API

This is a simple Product API built with Node.js and Sequelize. It supports basic CRUD operations and is designed to be tested using Mocha and Chai.

## Getting Started

To run this API, follow the steps below:

### Prerequisites

- Node.js (>= 20.x)
- MySQL 
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
      https://github.com/BenjiCoder02/LynxAssessment.git
2. Create a .env file with required credentials
    MYSQL_DB_URI={DB_HOST}  
    MYSQL_DB_PORT={DB_PORT}  
    MYSQL_DB_USER={DB_USER}  
    MYSQL_DB_PASSWORD={DB_PASSWORD}  
    PORT={SERVER_PORT}  
    HOST={SERVER_HOST}  
    MYSQL_DB_NAME={DB_NAME}  
    CURRENCY_API_KEY={CURRENCY_API_KEY}  

3. Install dependencies
  npm install
4. Start the server
  npm start or nodemon server.js

### Running tests
npm test

