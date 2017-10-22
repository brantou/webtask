var express    = require('express');
var Webtask    = require('webtask-tools');
var bodyParser = require('body-parser');
var request    = require("request");
var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/comment', function (req, res) {
  var options = { 
    method: 'GET',
    url: 'https://api.github.com/search/issues',
    qs: { 
      q: req.query.title,
      sort: 'created',
      order: 'desc'
    },
    headers: { 
      'cache-control': 'no-cache',
      'authorization': GITHUB_AUTH_TOKEN
    } };

  request(options, function (error, response, body) {
    if (error) res.sendStatus(404);
    var issue_url = body.items[0].url;
    var comment_url = issue_url + '/comments';
    var comment = {
      'body': '>'+req.query.highlightedText+"\n"+req.query.comment
    };
    
    var options = {
      method: 'POST',
      url: comment_url,
      headers: {
        'cache-control': 'no-cache',
        authorization: 'token 620ad8f55591d7f0c29ea815ee5f1690f3218781' 
      },
      body: JSON.stringify(comment) };

    request(options, function (error, response, body) {
      if (error) res.sendStatus(404);

      res.sendStatus(200);
    });
  });
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

module.exports = Webtask.fromExpress(app);
