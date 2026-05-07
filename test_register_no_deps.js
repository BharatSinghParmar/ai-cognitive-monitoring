const http = require('http');

const data = JSON.stringify({
    username: 'testuser_' + Date.now(),
    password: 'testpassword',
    faceDescriptor: Array.from({ length: 128 }, () => Math.random()),
    role: 'student'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', responseData);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
});

req.write(data);
req.end();
