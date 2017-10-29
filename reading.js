var express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser');
var request = require("request");
var app = express();

app.use(function(req, res, next) {
    console.log(req._readableState.buffer.toString());
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    res.send('hello world');
});

app.post('/issue', function(req, res) {
    if (req.body.action == "opened") {
        var issue = req.body.issue;
        var repository = req.body.repository;

        // set estimate to zenhub
        var zenhub_estimate_url = 'https://api.zenhub.io/p1/repositories/' +
            repository.id + '/issues/' + issue.number + '/estimate';
        var options = {
            method: 'PUT',
            url: zenhub_estimate_url,
            headers: newZenHubHeader(req.webtaskContext),
            form: {
                estimate: '1'
            }
        };
        request(options, function(error, response, body) {
            if (error) {
                console.log('[zenhub-estimate]', error);
                throw new Error(error);
            }

            console.log(body);
        });

        // set milestone and assignees
        var issue_obj = {
            'milestone': req.webtaskContext.meta.MILESTONE_NUMBER,
            'assignees': ['brantou']
        };
        editIssue(req.webtaskContext, issue.url, issue_obj);

        // TODO check dup
    }
    res.sendStatus(200);
});

app.post('/comment', function(req, res) {
    console.log(req.body);
    var issue_title = req.body.title;
    var comment_obj = {
        body: '>' +
            req.body.highlightedText.replace(/\n\n\n*/g, '\n\n').replace(/\n\n/g, '\n\n>') +
            '\n\n' + req.body.comment
    };
    searchIssue(req.webtaskContext, issue_title, comment_obj, newIssueComment);
    res.sendStatus(200);
});

app.post('/highlight', function(req, res) {
    console.log(req.body);
    var issue_title = req.body.title;
    var comment_obj = {
        body: '>' +
            req.body.text.replace(/\n\n\n*/g, '\n\n').replace(/\n\n/g, '\n\n>') +
            '\n\n精彩或睿智处，高亮备注！'
    };
    searchIssue(req.webtaskContext, issue_title, comment_obj, newIssueComment);
    res.sendStatus(200);
});

app.get('/archive', function(req, res) {
    console.log(req.query);
    var issue_title = req.query.title;
    var issue_obj = {
        'state': 'closed'
    };
    searchIssue(req.webtaskContext, issue_title, issue_obj, editIssue);
    res.sendStatus(200);
});

app.get('/like', function(req, res) {
    console.log(req.query);
    var issue_title = req.query.title;
    var labels = ['like'];
    searchIssue(req.webtaskContext, issue_title, labels, setIssueLabel);
    res.sendStatus(200);
});

function newGitHubHeader(context) {
    var auth_token = context.secrets.GITHUB_AUTH_TOKEN;
    return {
        'user-agent': 'brantou',
        'cache-control': 'no-cache',
        'authorization': 'token ' + auth_token
    };
}

function newZenHubHeader(context) {
    var zenhub_auth_token = context.secrets.ZENHUB_AUTH_TOKEN;
    return {
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'x-authentication-token': zenhub_auth_token
    };
}

function searchIssue(context, issue_title, na_obj, na_pfunc) {
    var repo = context.meta.REPO;
    var search_url = 'https://api.github.com/search/issues';
    var options = {
        method: 'GET',
        url: search_url,
        qs: {
            q: issue_title + ' state:open repo:' + repo,
            sort: 'created',
            order: 'desc'
        },
        headers: newGitHubHeader(context)
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

        na_pfunc(context, jsonBody.items[0].url, na_obj);
    });

}

function editIssue(context, issue_url, issue_obj) {
    var options = {
        method: 'PATCH',
        url: issue_url,
        headers: newGitHubHeader(context),
        body: JSON.stringify(issue_obj)
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log('[editIssue]', error);
            throw new Error(error);
        }
    });
}

function newIssueComment(context, issue_url, comment_obj) {
    var comment_url = issue_url + '/comments';
    var options = {
        method: 'POST',
        url: comment_url,
        headers: newGitHubHeader(context),
        body: JSON.stringify(comment_obj)
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log('[newIssueComment]', error);
            throw new Error(error);
        }
    });
}

function setIssueLabel(context, issue_url, labels) {
    var label_url = issue_url + '/labels';
    var options = {
        method: 'POST',
        url: label_url,
        headers: newGitHubHeader(context),
        body: JSON.stringify(labels)
    };
    request(options, function(error, response, body) {
        if (error) {
            console.log('[setIssueLabel]', error);
            throw new Error(error);
        }
    });
}

module.exports = Webtask.fromExpress(app);
