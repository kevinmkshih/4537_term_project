const endpointRoot = "/inventory_tracker";
port = "8000";

const express = require("express");
const app = express();
app.use(`${endpointRoot}/public`, express.static("public"));

const mysql = require("mysql");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
const url = require("url");

// #region Connect Database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "inventory_tracker"
})
db.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log("connected");
    }
})
// #endregion


//#region Get requests

app.get(endpointRoot + "/allItems", (req, res) => {

    sql = "SELECT * FROM items";
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            res.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end(err.message);
        } else {
            // if results is not empty
            if (results != 0) {
                res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end(JSON.stringify(results));
            // if results is empty
            } else {
                res.writeHead(404, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end("No inventory found.")
            }
    }
    })
})

app.get(endpointRoot + "/itemsid", (req, res) => {

    console.log("ok")
    let q = url.parse(req.url, true);
    let id = q.query['id'];
    let sql = `SELECT * FROM items WHERE id = ${id}`;
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            res.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end(err.message);
        } else {
            // if not empty result from database
            if (results.length != 0) {
                res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                let resultJson = JSON.stringify(results);
                res.end(JSON.stringify(results));
            // if empty result from database
            } else {
                res.writeHead(404, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end("Item not found");
            }

        }
    })
})

app.get(endpointRoot + "/itemsName/", (req, res) => {
    let q = url.parse(req.url, true);
})


//#endregion


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
