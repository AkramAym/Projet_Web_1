import mysql from 'mysql';

const con = mysql.createConnection({
    host: "localhost",
    user: "scott",
    password: "oracle",
    database: "MangathequeBD",
    charset: 'utf8mb4'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("connected!");
});

export default con;
