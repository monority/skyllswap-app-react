const http = require('http');
const d = JSON.stringify({ name: 'TestUser', email: `testreprise_${Date.now()}@example.com`, password: 'password123' });
const req = http.request(
    { host: 'localhost', port: 4000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } },
    res => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => { console.log('STATUS:' + res.statusCode); console.log('BODY:' + b); });
    }
);
req.write(d);
req.end();
