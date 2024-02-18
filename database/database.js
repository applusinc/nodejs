// database.js
const mysql = require('mysql2');


  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'apay',
    password: '',
    charset: 'utf8',
    connectTimeout : 5000,
    connectionLimit :1
  });

  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to MySQL database:', error);
    } else {
      console.log("Mysql Database'e bağlanıldı."
       );
    }
  }); 
module.exports = { connection }; 
