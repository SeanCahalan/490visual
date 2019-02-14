var express = require('express');
var http = require('http')
var socket = require('socket.io');
var bodyParser = require("body-parser");
var path = require("path");

var app = express();
var server = http.Server(app)
var io = socket(server)

require("dotenv").config();
app.set("env", process.env.NODE_ENV);

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

server.listen(process.env.PORT || 8083);
// WARNING: app.listen(80) will NOT work here!

let title = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

app.get('/', function (req, res) {
    //res.render('index', {title: title})
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(path.join(__dirname, "/")));


app.post('/annotate', function(req, res) {
    console.log(req.body)
    io.emit('annotate', req.body)
    res.end();
})

app.post('/correction', function(req, res) {
    console.log(req.body)
    io.emit('correction', req.body)
    res.end();
})

app.post('/debug', function(req, res) {
    console.log(req.body)
    io.emit('debug', req.body)
    res.end();
})

io.on('connection', function (socket) {
    socket.emit('news', { text: 'hello' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});