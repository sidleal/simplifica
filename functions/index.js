const functions = require('firebase-functions');
const querystring = require('querystring');
const http = require('http');
const environment = require('../../environments/environment');

exports.callPalavras = functions.https.onRequest((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");

    var post_data = querystring.stringify({
        'sentence' : request.body.sentence,
        'options' : request.body.options
    });

    var post_options = {
        host: environment.palavrasIP,
        port: environment.palavrasPort,
        path: '/' + request.body.type,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (res) {
            response.send(res);
        });
    });

    post_req.write(post_data);
    post_req.end()

});
