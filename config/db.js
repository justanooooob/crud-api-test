const mysql = require("mysql2");
const conn = mysql.createPool({
  host: "localhost",
  user: "heiwan",
  password: "heiwan123",
  database: "heiwan",
 // timezone: "UTC+7"
});
conn.getConnection((err) => {
  if (err) throw err;
  console.log("Database Connected!!");
});

module.exports = conn;
