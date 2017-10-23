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
  console.log(req.query);
  var auth_token = req.webtaskContext.secrets.GITHUB_AUTH_TOKEN;
  var options = { 
    method: 'GET',
    url: 'https://api.github.com/search/issues',
    qs: { 
      q: req.query.title + ' state:open repo:brantou/reading',
      sort: 'created',
      order: 'desc'
    },
    headers: { 
      'cache-control': 'no-cache',
      'authorization': 'token ' + auth_token,
      'User-Agent': 'brantou',
    } };
    console.log(options.qs);

  request(options, function (error, response, body) {
    if (error) {
      console.log(error);
      throw new Error(error);
    }
    
    var jsonBody = JSON.parse(body);
    var issue_url = jsonBody.items[0].url;
    var comment_url = issue_url + '/comments';
    var comment = {
      'body': '>'+req.query.highlightedText+'\n\n'+req.query.comment
    };
    
    var options = {
      method: 'POST',
      url: comment_url,
      headers: {
        'cache-control': 'no-cache',
        'User-Agent': 'brantou',
        authorization: 'token ' +auth_token
      },
      body: JSON.stringify(comment) };

    request(options, function (error, response, body) {
      if (error) {
        console.log(error);
        throw new Error(error);
      }
      
      console.log(JSON.parse(body));
    });
  });
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

module.exports = Webtask.fromExpress(app);
