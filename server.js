//import libraries
const ejs = require('ejs');
const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');


const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./model/database.db');

//create a host and port
const HOST_NAME = '127.0.0.1';
const PORT_NUM = process.env.PORT || 3000;

const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ttf': 'aplication/font-sfnt'
};

//location of template files
const filePath = __dirname + '/view/pages/'; //__dirname is always the current directory, same as ./
const index_path = filePath + 'home.ejs';
const menu_path = filePath + 'menu.ejs';
const createAcc_path = filePath + 'createAccount.ejs';
const cart_path = filePath + 'cart.ejs';
const login_path = filePath + 'login.ejs';

function renderStaticImages(req,res){

    let parsedUrl = url.parse(req.url,true);
    const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname, sanitizePath);
    fs.readFile(pathname, function(err, data){
        if(err){
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
        } else {
            // based on the URL path, extract the file extention. e.g. .js, .doc, ...
            const ext = path.parse(pathname).ext;
            // if the file is found, set Content-type and send data
            res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
            res.end(data);
        }
    });
}



var ingredientsAll = [];
var ingredientsPrice = [];
var ingredients1 = [];
var ingredients2 = [];
var ingredients3 = [];
var ingredients4 = [];

let ingredientAllSQL = `SELECT toppingName, toppingPrice FROM Ingredients`;
let ingredientPriceSQL = `SELECT toppingPrice FROM Ingredients`;
db.all(ingredientAllSQL, function(err, rows){
    rows.forEach(function (row){
        ingredientsAll.push(row.toppingName, row.toppingPrice);
    })
});
db.all(ingredientPriceSQL, function(err, rows){
    rows.forEach(function (row){
        ingredientsPrice.push(row.toppingPrice);
    })
});

let ingredientSQL = `SELECT toppingName FROM Ingredients WHERE ID IN (SELECT IngredientsID FROM PizzaItem WHERE PizzaID IN (SELECT ID FROM Pizza WHERE name = ?))`;
db.all(ingredientSQL, ['Meat Feast'], function(err, rows){
    rows.forEach(function (row){
        ingredients1.push(row.toppingName);
    })
});
db.all(ingredientSQL, ['Hawaiian'], function(err, rows){
    rows.forEach(function (row){
        ingredients2.push(row.toppingName);
    })
});
db.all(ingredientSQL, ['Vegetarian'], function(err, rows){
    rows.forEach(function (row){
        ingredients3.push(row.toppingName);
    })
});
db.all(ingredientSQL, ['Buffalo'], function(err, rows){
    rows.forEach(function (row){
        ingredients4.push(row.toppingName);
    })
});

var price = [];
var priceSQL = `Select price FROM Pizza WHERE name =?`;
var sidePriceSQL = `Select price FROM NonPizza WHERE name =?`;
db.all(priceSQL, ['Meat Feast'], function(err, rows){
    rows.forEach(function (row){
        price.push(row.price);
    })
});
db.all(priceSQL, ['Hawaiian'], function(err, rows){
    rows.forEach(function (row){
        price.push(row.price);
    })
});
db.all(priceSQL, ['Vegetarian'], function(err, rows){
    rows.forEach(function (row){
        price.push(row.price);
    })
});
db.all(priceSQL, ['Buffalo'], function(err, rows){
    rows.forEach(function (row){
        price.push(row.price);
    })
});

db.all(sidePriceSQL, ['Chicken Tenders'], function(err, rows){
    rows.forEach(function (row){
        price.push(row.price);
    })
});
db.all(sidePriceSQL, ['Garlic Bread'], function(err, rows){
    rows.forEach(function (row){
        price.push(row.price);
    })
});

const server = http.createServer((req, res) =>
{
    req.method;

    let parsedUrl = url.parse(req.url, true).pathname;
    ext = path.extname(parsedUrl);

    if(ext ==".jpg" || ext ==".png"){
        renderStaticImages(req,res);
        return;
    }
    if (req.url === '/') {
        ejs.renderFile(index_path, (err, data) =>
        {   console.log(err || data);
            res.end(data);
        });
    }
    else if (req.url === '/menu')
        ejs.renderFile(menu_path, {ingredients1:ingredients1, ingredients2:ingredients2, ingredients3:ingredients3, ingredients4:ingredients4, price:price, ingredientsAll:ingredientsAll, ingredientsPrice:ingredientsPrice}, (err, data) =>
        {    console.log(err || data);
            res.end(data);
        });
    else if (req.url === '/menu' && req.method === 'GET'){

    }
    else if (req.url === '/createAccount')
        ejs.renderFile(createAcc_path, (err, data) =>
        {    console.log(err || data);
            res.end(data);
        });
    else if (req.url ==='/createAccount' && req.method === 'POST') {
        const options = {
            hostname: '127.0.0.1',
            port: process.env.PORT || 3000,
            path: '/createAccount',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }

        const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`)

            res.on('data', (d) => {
                process.stdout.write(d)
            })
        })

        req.on('error', (error) => {
            console.error(error)
        })

        req.write(data)
        req.end()
         }

        /*
     db.run('INSERT into customer(ID, fName, lName, username, passwd, email, phoneNo, street, addressNo, city )' +
    'values(?, ?, ?, ?, ?, ?, ?, ?, ?, ? )',
    function(err, row){
    if(err)
        {
            console.log(err.message);
        }
            console.log("entry added to table");
        })
        */



    else if (req.url === '/cart')
        ejs.renderFile(cart_path, (err, data) =>
        {    console.log(err || data);
            res.end(data);
        });
    else if (req.url === '/login')
        ejs.renderFile(login_path, (err, data) =>
        {    console.log(err || data);
            res.end(data);
        });
    else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

//listen to the http server with the dedicated port number
server.listen(PORT_NUM, HOST_NAME, function ()
{
    console.log("Server is running");
});


db.close();