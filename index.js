const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;
let server = require('./server');
let config = require('./config');
let middleware = require('./middleware');
const response = require('express');

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'hospitalDB';
let db

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);
});

//Get details of hospitals
app.get('/hospitaldetails', middleware.checkToken, function (req, res) {
    console.log("Getting data from Hospital Collection");
    var data = db.collection('hospitals').find().toArray().then(result => res.json(result));
});

//Get details of ventilators
app.get('/ventilatordetails', middleware.checkToken, function (req, res) {
    console.log("Getting data from Ventilator Collection");
    var ventilatordetails = db.collection('ventilators').find().toArray().then(result => res.json(result));
});

// Searching Ventilator by Status Using Body
app.post('/searchventbystatus', middleware.checkToken, (req, res) => {
    var status = req.body.status;
    console.log(status);
    var ventilatordetails = db.collection('ventilators').find({ "status": status }).toArray().then(result => res.json(result));
});

//Searching Ventilators by Hospital Name Using Query
app.post('/searchventbyname', middleware.checkToken, (req, res) => {
    var name = req.query.name;
    console.log(name);
    var ventilatordetails = db.collection('ventilators').find({ 'name': new RegExp(name, 'i') }).toArray().then(result => res.json(result));
});

//Searching Hospital by name
app.post('/searchhospital', middleware.checkToken, (req, res) => {
    var name = req.query.name;
    console.log(name);
    var hospitaldetails = db.collection('hospitals').find({ 'name': new RegExp(name, 'i') }).toArray().then(result => res.json(result));
});

//Update Details of Ventilator
app.put('/updateventilator', middleware.checkToken, (req, res) => {
    var ventid = { ventilatorId: req.body.ventilatorId };
    console.log(ventid);
    var newvalues = { $set: { status: req.body.status } };
    db.collection("ventilators").updateOne(ventid, newvalues, function (err, result) {
        res.json('1 document updated');
        if (err) throw err;
    });
});

//Adding Ventilator
app.post('/addventilatorbyuser', middleware.checkToken, (req, res) => {
    var hId = req.body.hId;
    var ventilatorId = req.body.ventilatorId;
    var status = req.body.status;
    var name = req.body.name;

    var item = {
        hId: hId, ventilatorId: ventilatorId, status: status, name: name
    };
    db.collection('ventilators').insertOne(item, function (err, result) {
        res.json('Item inserted');
    });
});

//Delete Ventilator using VentilatorId
app.delete('/delete', middleware.checkToken, (req, res) => {
    var myquery = req.query.ventilatorId;
    console.log(myquery);

    var myquery1 = { ventilatorId: myquery };
    db.collection('ventilators').deleteOne(myquery1, function (err, obj) {
        if (err) throw err;
        res.json("1 document deleted");
    });
});
app.listen(1100);