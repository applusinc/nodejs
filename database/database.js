// database.js
const mysql = require('mysql2');


  const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'apay',
    password: '',
    charset: 'utf8',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

  });

module.exports = { connection }; 
