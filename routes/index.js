var express = require('express');
var router = express.Router();
var socketsio = require('../app').socketsio;

const EventEmitter = require('events');
const myEmitter = new EventEmitter();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });

    myEmitter.on('update', function(data) {
        console.log(data)
        res.wr('index', { title: 'NICE'});
    })
});

router.post('/', function(req, res, next) {
    console.log(req.body)
    socketsio.emit('webhooks', req.body);
    res.end();
})

module.exports = router;
