const https = require('https');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const certfile = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'));
const keyfile = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'));

const API_ENDPOINT = 'http://127.0.0.1:8000/';
const BASE_URL = 'http://iamsocool.com';

https.createServer(
    {
        cert: certfile,
        key: keyfile,
        passphrase: 'hp2009f96',
        rejectUnauthorized: false,
    },
    function (request, response) {
        axios.post(API_ENDPOINT, {
            Request: request.method + ' ' + request.url,
            AcceptHdr: request.headers['accept'],
            Encoding: request.headers['accept-encoding'],
            Lang: request.headers['accept-language'],
            Agent: request.headers['user-agent'],
            Cookie: request.headers['cookie'],
            Cdata: request.method === 'GET' ? '0' : request.headers['content-data'],
            Clength: request.method === 'GET' ? '0' : request.headers['content-length'],
            URL: BASE_URL + request.url
          })
            .then(apiResponse => {
                if (apiResponse.data === 'Malicious') {
                    response.writeHead(403);
                    response.end('Forbidden');
                } else {
                    const options = {
                        hostname: 'pythonanywhere.com',
                        port: '443',
                        path: request.url,
                        method: request.method,
                        headers: request.headers,
                        rejectUnauthorized: false,
                        requestCert: true,
                    };

                    makeRequest(options, request, response);
                }
            })
            .catch(error => {
                console.error('API error:', error);
                response.writeHead(500);
                response.end('Internal Server Error');
            });

    }).listen(4040);

const makeRequest = (options, clientRequest, clientResponse) => {
    const proxy = https.request(options, res => {
        clientResponse.writeHead(res.statusCode, res.headers);
        res.pipe(clientResponse, { end: true });
    });

    clientRequest.pipe(proxy, { end: true });
};
