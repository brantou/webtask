var express    = require('express');
var Webtask    = require('webtask-tools');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/comment', function (req, res) {
  console.log(req.query);
  console.log(req.body);
  res.sendStatus(200);
});

app.get('/highlight', function (req, res) {
  console.log(req.query);
  console.log(req.body);
  res.sendStatus(200);
});

app.get('/archive', function (req, res) {
  console.log(req.query);
  console.log(req.body);
  res.sendStatus(200);
});

app.get('/like', function (req, res) {
  console.log(req.query);
  console.log(req.body);
  res.sendStatus(200);
});

app.get('/tag', function (req, res) {
  console.log(req.query);
  console.log(req.body);
  res.sendStatus(200);
});

module.exports = Webtask.fromExpress(app);
