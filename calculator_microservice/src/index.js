const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuration
const CONFIG = {
  WINDOW_SIZE: 10,
  TEST_SERVER_URL: 'http://20.244.56.144/evaluation-service',
  TIMEOUT: 500
};

// Store for number windows
const numberWindows = {
  p: [],  // prime numbers
  f: [],  // fibonacci numbers
  e: [],  // even numbers
  r: []   // random numbers
};

// API endpoints mapping
const API_ENDPOINTS = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand'
};

// Helper function to calculate average
const calculateAverage = (numbers) => {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
};

// Helper function to update window
const updateWindow = (window, newNumbers) => {
  const uniqueNumbers = newNumbers.filter(n => !window.includes(n));
  const updatedWindow = [...window];
  
  for (const num of uniqueNumbers) {
    if (updatedWindow.length >= CONFIG.WINDOW_SIZE) {
      updatedWindow.shift(); // Remove oldest number
    }
    updatedWindow.push(num);
  }
  
  return updatedWindow;
};

// Store for authentication tokens
let authToken = null;

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const registrationData = {
      "email": "22053257@kiit.ac.in",
      "name": "Naman Ahuja",
      "mobileNo": "6375804297",
      "githubUsername": "NamanAhuja30",
      "rollNo": "22053257",
      "collegeName": "KIIT University",
      "accessCode": "nwpwrZ"
    };

    console.log('Attempting registration with data:', registrationData);
    
    const response = await axios.post(`${CONFIG.TEST_SERVER_URL}/register`, registrationData, {
      timeout: CONFIG.TIMEOUT * 2,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful. Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Registration Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Registration request timed out' });
    }
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || 'Registration failed';
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message
    });
  }
});

// Authentication endpoint
app.post('/auth', async (req, res) => {
  try {
    // Validate required fields
    const { email, name, rollNo, accessCode, clientID, clientSecret } = req.body;
    if (!email || !name || !rollNo || !accessCode || !clientID || !clientSecret) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Authentication Request:', { email, name, rollNo, accessCode });
    
    const response = await axios.post(`${CONFIG.TEST_SERVER_URL}/auth`, req.body);
    console.log('Authentication Response:', response.data);
    
    authToken = response.data.access_token;
    res.json(response.data);
  } catch (error) {
    console.error('Authentication Error:', error.response?.data || error.message);
    res.status(401).json({ 
      error: error.response?.data || 'Authentication failed',
      details: error.message
    });
  }
});

// Average calculator endpoint
app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid.toLowerCase();
  
  if (!API_ENDPOINTS[numberid]) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const response = await axios.get(`${CONFIG.TEST_SERVER_URL}/numbers/${API_ENDPOINTS[numberid]}`, {
      timeout: CONFIG.TIMEOUT,
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const numbers = response.data.numbers || [];
    numberWindows[numberid] = updateWindow(numberWindows[numberid], numbers);

    res.json({
      numbers: numberWindows[numberid],
      average: calculateAverage(numberWindows[numberid])
    });
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    res.status(500).json({ error: 'Failed to fetch numbers from server' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});