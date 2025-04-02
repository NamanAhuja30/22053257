# Average Calculator Microservice

## Overview
This microservice provides a REST API for calculating averages of different number sequences (prime, Fibonacci, even, and random numbers) with a configurable window size.

## API Endpoints

### 1. Registration
- **Endpoint:** `POST /register`
- **Purpose:** Register with the test server
- **Request Body:**
  ```json
  {
    "email": "<university_email>",
    "name": "<your_name>",
    "mobileNo": "<mobile_number>",
    "githubUsername": "<github_username>",
    "rollNo": "<roll_number>",
    "collegeName": "<college_name>",
    "accessCode": "<access_code>"
  }
  ```

### 2. Authentication
- **Endpoint:** `POST /auth`
- **Purpose:** Obtain authorization token
- **Request Body:**
  ```json
  {
    "email": "<university_email>",
    "name": "<your_name>",
    "rollNo": "<roll_number>",
    "accessCode": "<access_code>",
    "clientID": "<client_id>",
    "clientSecret": "<client_secret>"
  }
  ```

### 3. Average Calculator
- **Endpoint:** `GET /numbers/:numberid`
- **Purpose:** Calculate average of specified number sequence
- **Parameters:**
  - `numberid`: Type of numbers (p: prime, f: fibonacci, e: even, r: random)
- **Response:**
  ```json
  {
    "numbers": [...],
    "average": number
  }
  ```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. For development with hot reload:
   ```bash
   npm run dev
   ```

## Testing
Run tests using:
```bash
 npm test
```

## Window Size Configuration
The window size for number sequences is configured to 10 by default. This can be modified in the CONFIG object in `src/index.js`.

## Error Handling
The API includes comprehensive error handling for:
- Invalid number types
- Registration failures
- Authentication errors
- Server errors

## Technologies Used
- Node.js
- Express.js
- Axios for HTTP requests
- Jest for testing
- Nodemon for development