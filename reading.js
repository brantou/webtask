var express    = require('express');
var Webtask    = require('webtask-tools');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/comment', function (req, res) {
  console.log(req.body);
  res.send('comment to github');
});

app.get('/highlight', function (req, res) {
  res.send('comment to github');
});

app.get('/archive', function (req, res) {
  res.send('comment to github');
});

app.get('/like', function (req, res) {
  res.send('add liked label');
});

app.get('/tag', function (req, res) {
  res.send('add tag-name label');
});

module.exports = Webtask.fromExpress(app);
