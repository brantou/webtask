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
      q: encodeURIComponent(req.query.title.replace(/\s/g, '+'))+'%20state:open%20repo:brantou/reading',
      sort: 'created',
      order: 'desc'
    },
    headers: { 
      'cache-control': 'no-cache',
      'authorization': 'token ' + auth_token,
      'User-Agent': 'brantou',
    } };
    console.log(options);

  request(options, function (error, response, body) {
    if (error) {
      console.log(error);
      throw new Error(error);
    }
    console.log(body);
    
    var issue_url = body.items[0].url;
    var comment_url = issue_url + '/comments';
    var comment = {
      'body': '>'+req.query.highlightedText+'\n'+req.query.comment
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
      console.log(options);

    request(options, function (error, response, body) {
      if (error) {
        console.log(error);
        throw new Error(error);
      }
      
      console.log(body);
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
