const express = require('express');
const path = require('path');
const session = require('express-session');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
};

// Routes

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute(
    'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
    [username, password]
  );
  await conn.end();

  if (rows.length > 0) {
    req.session.user = rows[0];
    const role = rows[0].role;
    if (role === 'owner') {
      res.redirect('/owner-dashboard.html');
    } else if (role === 'walker') {
      res.redirect('/walker-dashboard.html');
    } else {
      res.send('Unknown role');
    }
  } else {
    res.send('Login failed');
  }
});


const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;