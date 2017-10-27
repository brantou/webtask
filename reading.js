var express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser');
var request = require("request");
var app = express();

app.use(function (req, res, next) {
  console.log(req._readableState.buffer.toString());
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.send('hello world');
});

app.post('/issue', function(req, res) {
    if (req.body.action == "opened") {
        var github_auth_token = req.webtaskContext.secrets.GITHUB_AUTH_TOKEN;
        var zenhub_auth_token = req.webtaskContext.secrets.ZENHUB_AUTH_TOKEN;
        var issue = req.body.issue;
        var repository = req.body.repository;

        var zenhub_estimate_url = 'https://api.zenhub.io/p1/repositories/' + repository.id + '/issues/' + issue.number + '/estimate';
        var options = {
            method: 'PUT',
            url: zenhub_estimate_url,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded',
                'x-authentication-token': zenhub_auth_token
            },
            form: {
                estimate: '1'
            }
        };
        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }

            console.log(body);
        });

        var issue_body = {
            'milestone': req.webtaskContext.meta.MILESTONE_NUMBER,
            'assignees': ['brantou']
        };
        options = {
            method: 'PATCH',
            url: issue.url,
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'brantou',
                authorization: 'token ' + github_auth_token
            },
            body: JSON.stringify(issue_body)
        };

        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }

            //console.log(JSON.parse(body));
        });
    }
    res.sendStatus(200);
});

app.post('/comment', function(req, res) {
    console.log(req.body);
    var title = req.body.title;
    var auth_token = req.webtaskContext.secrets.GITHUB_AUTH_TOKEN;
    var repo = req.webtaskContext.meta.REPO;
    var options = {
        method: 'GET',
        url: 'https://api.github.com/search/issues',
        qs: {
            q: title + ' state:open repo:' + repo,
            sort: 'created',
            order: 'desc'
        },
        headers: {
            'cache-control': 'no-cache',
            'authorization': 'token ' + auth_token,
            'User-Agent': 'brantou'
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
            throw new Error(error);
        }

        var jsonBody = JSON.parse(body);
        if (jsonBody.items.length < 1) {
            return;
        }

        var issue_url = jsonBody.items[0].url;
        var comment_url = issue_url + '/comments';
        var comment = {
            body: '>' + req.body.highlightedText.replace(/\n\n\n*/g, '\n\n').replace(/\n\n/g, '\n\n>') + '\n\n' + req.body.comment
        };

        var options = {
            method: 'POST',
            url: comment_url,
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'brantou',
                'authorization': 'token ' + auth_token
            },
            body: JSON.stringify(comment)
        };

        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }

            //console.log(JSON.parse(body));
        });
    });
    res.sendStatus(200);
});

app.post('/highlight', function(req, res) {
    console.log(req.body);
    var title = req.body.title;
    var text = req.body.text;
    var auth_token = req.webtaskContext.secrets.GITHUB_AUTH_TOKEN;
    var repo = req.webtaskContext.meta.REPO;
    var options = {
        method: 'GET',
        url: 'https://api.github.com/search/issues',
        qs: {
            q: title + ' state:open repo:' + repo,
            sort: 'created',
            order: 'desc'
        },
        headers: {
            'cache-control': 'no-cache',
            'authorization': 'token ' + auth_token,
            'User-Agent': 'brantou'
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
            throw new Error(error);
        }

        var jsonBody = JSON.parse(body);
        if (jsonBody.items.length < 1) {
            return;
        }

        var issue_url = jsonBody.items[0].url;
        var comment_url = issue_url + '/comments';
        var comment = {
            body: '>' + text.replace(/\n\n\n*/g, '\n\n').replace(/\n\n/g, '\n\n>') + '\n\n精彩或睿智处，高亮备注！'
        };

        var options = {
            method: 'POST',
            url: comment_url,
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'brantou',
                authorization: 'token ' + auth_token
            },
            body: JSON.stringify(comment)
        };

        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }

            //console.log(JSON.parse(body));
        });
    });
    res.sendStatus(200);
});

app.get('/archive', function(req, res) {
    console.log(req.query);
    var auth_token = req.webtaskContext.secrets.GITHUB_AUTH_TOKEN;
    var repo = req.webtaskContext.meta.REPO;
    var options = {
        method: 'GET',
        url: 'https://api.github.com/search/issues',
        qs: {
            q: req.query.title + ' state:open repo:' + repo,
            sort: 'created',
            order: 'desc'
        },
        headers: {
            'cache-control': 'no-cache',
            'authorization': 'token ' + auth_token,
            'User-Agent': 'brantou'
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
            throw new Error(error);
        }

        var jsonBody = JSON.parse(body);
        if (jsonBody.items.length < 1) {
            return;
        }

        var issue_url = jsonBody.items[0].url;
        var issue_body = {
            'state': 'closed'
        };

        var options = {
            method: 'PATCH',
            url: issue_url,
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'brantou',
                'authorization': 'token ' + auth_token
            },
            body: JSON.stringify(issue_body)
        };

        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }

            //console.log(JSON.parse(body));
        });
    });
    res.sendStatus(200);
});

app.get('/like', function(req, res) {
    console.log(req.query);
    var auth_token = req.webtaskContext.secrets.GITHUB_AUTH_TOKEN;
    var repo = req.webtaskContext.meta.REPO;
    var options = {
        method: 'GET',
        url: 'https://api.github.com/search/issues',
        qs: {
            q: req.query.title + ' state:open repo:' + repo,
            sort: 'created',
            order: 'desc'
        },
        headers: {
            'cache-control': 'no-cache',
            'authorization': 'token ' + auth_token,
            'User-Agent': 'brantou'
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
            throw new Error(error);
        }

        var jsonBody = JSON.parse(body);
        if (jsonBody.items.length < 1) {
            return;
        }

        var issue_url = jsonBody.items[0].url;
        var label_url = issue_url + '/labels';
        var labels = ['like'];

        var options = {
            method: 'POST',
            url: label_url,
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'brantou',
                authorization: 'token ' + auth_token
            },
            body: JSON.stringify(labels)
        };

        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
                throw new Error(error);
            }

            //console.log(JSON.parse(body));
        });
    });
    res.sendStatus(200);
});

module.exports = Webtask.fromExpress(app);
