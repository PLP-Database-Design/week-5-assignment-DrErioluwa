const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize the express app
const app = express();

// Load environment variables from .env
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to the MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test the MySQL connection
db.connect((err) => {
  if (err) {
    return console.error('Error connecting to the MySQL database:', err);
  }
  console.log(`Connected to MySQL successfully as id: ${db.threadId}`);
});

// Set view engine to EJS and configure views directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Root route with a simple home page rendered using EJS
app.get('/', (req, res) => {
  res.render('home', { message: 'Welcome to the Hospital Management System!' });
});

// Route to display all patients
app.get('/patients', (req, res) => {
    console.log("GET /patients called");
    const query = 'SELECT * FROM patients';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error retrieving patients:', err);
        return res.status(500).send('Error retrieving patients data');
      }
      console.log("Data retrieved:", results);
      res.render('patients', { results });
    });
});

// Route to display all providers
app.get('/providers', (req, res) => {
  const query = 'SELECT * FROM providers';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving providers:', err);
      return res.status(500).send('Error retrieving providers data');
    }

    // Render the data in providers.ejs
    res.render('providers', { results });
  });
});

// Route to filter patients by first name
app.get('/patients/search', (req, res) => {
    const { firstName } = req.query;
    console.log(`GET /patients/search?firstName=${firstName} called`);
    const query = 'SELECT * FROM patients WHERE first_name LIKE ?';
    db.query(query, [`%${firstName}%`], (err, results) => {
      if (err) {
        console.error('Error searching for patients:', err);
        return res.status(500).send('Error searching patients data');
      }
      console.log("Filtered patients data:", results);
      res.render('patients', { results });
    });
});

app.get('/providers/specialty/:specialty', (req, res) => {
    const { specialty } = req.params;
    console.log(`GET /providers/specialty/${specialty} called`);
    const query = 'SELECT * FROM providers WHERE provider_specialty = ?';
    db.query(query, [specialty], (err, results) => {
      if (err) {
        console.error('Error retrieving providers by specialty:', err);
        return res.status(500).send('Error retrieving providers by specialty');
      }
      console.log("Providers data for specialty:", results);
      res.render('providers', { results });
    });
});

// Start the server on the port specified in .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
