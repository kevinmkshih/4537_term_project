const config = require("./config");
const endpointRoot = "/inventory_tracker";
const port = "8000";
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(`${endpointRoot}/public`, express.static("public"));

const mysql = require("mysql");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
const url = require("url");
const path = require("path");

//#region Connect Database
const db = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
})
db.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log("connected");
    }
})
//#endregion


//#region Get requests item

app.get(endpointRoot + "/allItems", (req, res) => {
    addApiCount("/allItems");
    let sql = "SELECT * FROM items";
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
    addApiCount("/itemsid");
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

app.get(endpointRoot + "/itemsName", (req, res) => {
    addApiCount("/itemsName")
    let q = url.parse(req.url, true);
})
//#endregion

//#region api history
app.get(endpointRoot + "/", (req, res) => {
    let sql = "SELECT * FROM api_access"
    db.query(sql, (err, results) => {
        if (err) {
            throw err;
        } else {
            res.end(JSON.stringify(results))
            // returns [{"name":"/allItems","count":5},{"name":"/itemsid","count":1}]
        }
    })
})

function addApiCount(route) {
    let sql = `update api_access set count = count + 1 where name = '${route}'`;
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("added api access count");
        }
    })
}


//#endregion

//#region Swagger

app.get(endpointRoot + "/docs", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/swagger.html"));
})

//#endregion


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
