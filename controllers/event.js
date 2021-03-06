var request = require('request');

/**
 * GET /
 */
exports.index = function(req, res) {
    res.render('home', {
        title: 'Home'
    });
};

/**
 * GET /authRedirect
 */
exports.authRedirect = function(req, res) {
    response.writeHead(302, {
        'Location': 'https://slack.com/oauth/authorize',
        'client_id': process.env.CLIENT_ID,
        'scope': 'incoming-webhook commands'
    });
    response.end();
}

/**
 * POST /slack/eventNames
 */
exports.getEvents = function(req, res) {
    if (req.body.token == process.env.SLACK_TOKEN) {
        var options = {headers:{'X-TBA-App-Id':'tsuruta:slack_scouting:v1'}};
        var eventCodes = '';
        request.get('https://thebluealliance.com/api/v2/events/2017',options,function(err,response,body){
            if(err)
            {
                //TODO: Say something about an error.
            }
            jsonResponse = JSON.parse(body);
            for (i = 0; i < jsonResponse.length; i ++)
            {
                eventCodes += jsonResponse[i].short_name + '  -  2017' + jsonResponse[i].event_code + '\n';
            }
            var slackResponse = {
                text: "Here is a list of all event codes:",
                attachments: [
                    {
                        text: eventCodes
                    }
                ]
            };
            res.send(slackResponse);
        });
    }
    else {
        //Not a request sent through Slack
        res.send('Only works through Slack.');
    }
};

/**
 * POST /slack/setup
 */
exports.setupEvent = function(req, res) {
    if (req.body.token == process.env.SLACK_TOKEN) {
        var options = {headers:{'X-TBA-App-Id':'tsuruta:slack_scouting:v1'}};
        var eventCode = req.body.text;
        var matches = ''
        request.get('https://thebluealliance.com/api/v2/event/' + eventCode + '/matches',options,function(err,response,body){
            if(err)
            {
                //TODO: Say something about an error. Probably bad event code.
                var slackResponse = {
                    text: "That event code didn't work.",
                };
                res.send(slackResponse);
            }
            jsonResponse = JSON.parse(body);
            for (i = 0; i < jsonResponse.length; i ++)
            {

                if (jsonResponse[i].comp_level == "qm")
                {
                    var blue = jsonResponse[i].alliances.blue.teams[0].toUpperCase() + ', '
                            + jsonResponse[i].alliances.blue.teams[1].toUpperCase() + ', ' + jsonResponse[i].alliances.blue.teams[2].toUpperCase() + '\n'
                    var red = jsonResponse[i].alliances.red.teams[0].toUpperCase() + ', ' + jsonResponse[i].alliances.red.teams[1].toUpperCase() + ', '
                    + jsonResponse[i].alliances.red.teams[2].toUpperCase();
                    var slackResponse = {
                        text: "Match Number " + jsonResponse[i].match_number,
                        attachments: [
                            {
                                color: "#3AA3E3",
                                text: blue
                            },
                            {
                                color: "#cc0000",
                                text: red
                            }
                        ]
                    };
                    send(slackResponse, function(error, status, body) {
                        if (error) {
                            return next(error);
                        } else if (status !== 200)
                        {
                            return next(new Error('incoming webhook: ' + status));
                        }
                        else {
                            return res.status(200).end();
                        }
                    });
                }
            }
            return res.status(200).end();
        });
    }
    else {
        //Not a request sent through Slack
        res.send('Only works through Slack.');
    }
}

function send (payload, callback) {
    var webhook = 'T4AR5CF6D/B4B2H4SD6/lScabD2miBF2VyciocJt4HTt';
    var uri = 'https://hooks.slack.com/services/' + webhook;
    request({
        uri: uri,
        method: 'POST',
        body: JSON.stringify(payload)
    }, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        callback(null, response.statusCode, body);
    });
}
