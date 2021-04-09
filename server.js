const config = require("./config");
const endpointRoot = "/inventory_tracker";
const port = "8000";
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(`${endpointRoot}/public`, express.static("public"));

const mysql = require("mysql");

const promise = require("promise");
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

//#region Items

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

app.delete(endpointRoot + "/deleteItemId/:id", (req, res) => {
    let sql = `DELETE FROM items WHERE id = ${req.params.id}`;
    let itemFound = searchItem(req.params.id);
    itemFound.then((result) => {
        if (result === 200) {
            db.query(sql, (err, result) => {
                res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end("Item deleted");
            })
        } else if (result === 400) {
            res.writeHead(400, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end("Item not found");
        } else {
            res.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end(result.message);

        }
    })


})

app.get(endpointRoot + "/itemsid", (req, res) => {
    addApiCount("/itemsid");
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
                res.end(JSON.stringify(results));
                // if empty result from database
            } else {
                res.writeHead(404, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end("Item not found");
            }

        }
    })
})

app.put(endpointRoot + "/updateItemStock", (req, res) => {
    let q = url.parse(req.url, true);
    let id = q.query['id'];
    let quantity = q.query['quantity'];
    let getAmountSQL = `update items set quantity = ${quantity} where id = ${id}`;
    db.query(getAmountSQL, (err, results) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            console.log(err.message);
        } else {
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end("Quantity successfully updated.")
        }
    })
})

app.put(endpointRoot + "/updateName", (req, res) => {
    let body = '';
    let jsonBody;
    req.on("data", (chunk) => {
        if (chunk != null) {
            body += chunk;
        }
    })
    req.on("end", () => {
        jsonBody = JSON.parse(body);
        console.log(jsonBody.name)

        sql = `UPDATE items SET name = '${jsonBody.name}' WHERE id = ${jsonBody.id}`
        db.query(sql, (err, result) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end(err.message)
            } else {
                res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end("Name successfully updated")
            }
        })
    })
})

app.post(endpointRoot + "/addNewItem", (req, res) => {
    let body = "";
    let jsonBody;
    req.on("data", (chunk) => {body += chunk;})
    req.on("end", () => {
        jsonBody = JSON.parse(body);
        let quantity;
        let description;
        jsonBody.quantity = null ? quantity = 0 : quantity = jsonBody.quantity;
        jsonBody.description = null ? description = '' : description = jsonBody.description;
        let sql = `INSERT INTO items (name, quantity, description) VALUES ("${jsonBody.name}", ${quantity}, "${description}")`;
        let searchResult = searchItemByName(jsonBody.name);
        searchResult.then((resolved) => {
            if (resolved == 200) {
                db.query(sql, (err, results) => {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                        res.end(err.message);
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                        res.end("Name successfully added")
                    }
                })
            } else if (resolved == 406) {
                res.writeHead(406, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
                res.end("Item already in database");

            }
        })
    })
})

function searchItemByName(name) {
    return new Promise((resolve, reject) => {
        let searchSQL = `SELECT * FROM items WHERE name = '${name}'`;
        db.query(searchSQL, (err, results) => {
            if (err) {
                console.log(err.message);
                reject(err.message);
            }
            if (results != 0) {
                resolve(406);
            } else {
                resolve(200);
            }
        })
    })
}

function searchItem(id) {
    return new Promise((resolve, reject) => {
        let searchSQL = `SELECT * FROM items WHERE id = ${id}`;
        db.query(searchSQL, (err, results) => {
            if (err) {
                console.log(err.message);
                reject(err.message);
            }
            if (results != 0) {
                resolve(200);
            } else {
                resolve(404);
            }
        })
    })
}


//#endregion

//#region api history
app.get(endpointRoot + "/getApiCount", (req, res) => {
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
