var express = require('express');
var router = express.Router();
const connection = require('../lib/conn');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Get all users without password
 */
router.get('/all', function (req, res) {
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'error with connection' });
    }

    let selectQuery = 'SELECT * FROM users';

    connection.query(selectQuery, (err, users) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'error with connection' });
      }

      const sentResults = users.map((user) => {
        const userNoPass = { ...user };
        delete userNoPass.password;
        return userNoPass;
      });

      res.json(sentResults);
    });
  });
});

/**
 * Get specific user using user id in param
 */
router.get('/:userId', function (req, res) {
  console.log(req.body);
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'error with connection' });
    }

    let selectQuery = `SELECT uuid, email, name FROM users WHERE uuid="${req.params.userId}"`;

    connection.query(selectQuery, (err, userData) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'error with connection' });
      }

      console.log('user', userData[0]);
      res.json(userData[0]);
    });
  });
});

/**
 * Login user
 * Uses SELECT query to check if user exists
 * Decrypts password and checks if it is correct
 * If true sends jwt token as http cookie and json object with id and name
 *
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'error with connection' });
    }

    let query = `SELECT * FROM users WHERE email = ?`;

    connection.query(query, [email], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'error with connection' });
      }

      if (result.length === 0) {
        console.log('user does not exist');
        return res.status(402).json({ error: 'user does not exist' });
      }

      const hashPassword = result[0].password;
      const { name, uuid } = result[0];

      bcrypt.compare(password, hashPassword, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'error with connection' });
        }

        if (data) {
          const token = jwt.sign({ userId: uuid }, process.env.JWT_KEY, {
            expiresIn: '1h',
          });
          res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
          });
          res.json({ name: name, id: uuid });
        } else {
          res.status(401).json({ error: 'password is incorrect' });
        }
      });
    });
  });
});

/**
 * Checks if user already exists with select query
 * Encrypts password with hashing
 * Inserts into database
 */
router.post('/add', (req, res) => {
  const { name, email, password } = req.body;
  const userId = uuidv4();
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'error with connection' });
    }

    let selectQuery = 'SELECT * FROM users WHERE email = ?';

    connection.query(selectQuery, [email], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'error with connection' });
      }

      if (result.length > 0) {
        console.log('user already exists');
        return res.status(409).json({ error: 'user already exist' });
      }

      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'error crypting password' });
        }
        let query = `INSERT INTO users (uuid, name, email, password) VALUES (?, ?, ?, ?)`;
        connection.query(query, [userId, name, email, hash], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: 'error with connection' });
          }
          res
            .status(201)
            .json({ message: 'User added', name: name, email: email });
        });
      });
    });
  });
});

module.exports = router;
