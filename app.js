const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    req.pool = pool;
    next();
});
app.use(express.static('public', {
    setHeaders: (res, path) => {
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

const db_config = {
    host: "98.215.98.126",
    user: "master_account",
    password: "Bu8103561x.1848",
    database: "CIS475"
};

const pool = mysql.createPool(db_config);

pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
    connection.release();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'loans.html'));
});

app.use('/api', routes);

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'users.html'));
});

app.get('/loans', (req, res) => {
    res.sendFile(path.join(__dirname, 'loans.html'));
});

app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'books.html'));
});

app.get('/publishers', (req, res) => {
    res.sendFile(path.join(__dirname, 'publishers.html'));
});

app.get('/authors', (req, res) => {
    res.sendFile(path.join(__dirname, 'authors.html'));
});


app.listen(port, () => {
    console.log(`Library Management System app listening at http://localhost:${port}`);
});
