const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/users/register', {
            username: 'testuser_' + Date.now(),
            password: 'testpassword',
            faceDescriptor: Array.from({ length: 128 }, () => Math.random()),
            role: 'student'
        });
        console.log('SUCCESS:', res.data);
    } catch (err) {
        console.error('FAILURE:', err.response ? err.response.data : err.message);
    }
}

testRegister();
