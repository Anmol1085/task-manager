const axios = require('axios');
const API_URL = 'http://localhost:5001/api';

async function testPerformance() {
    try {
        // 1. Register/Login
        const email = `test${Date.now()}@example.com`;
        console.log('Registering user:', email);
        const authStart = Date.now();
        const authRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password: 'password123',
            name: 'Test User'
        });
        console.log(`Auth took ${Date.now() - authStart}ms`);

        const cookies = authRes.headers['set-cookie'];
        const token = cookies.find(c => c.startsWith('accessToken')).split(';')[0].split('=')[1];

        // 2. Get Tasks
        console.log('Fetching tasks...');
        const taskStart = Date.now();
        try {
            await axios.get(`${API_URL}/tasks`, {
                headers: { Cookie: `accessToken=${token}` }
            });
            console.log(`Tasks took ${Date.now() - taskStart}ms`);
        } catch (e) {
            console.log(`Tasks failed after ${Date.now() - taskStart}ms: ${e.message}`);
        }

        // 3. Get Notifications
        console.log('Fetching notifications...');
        const notifStart = Date.now();
        try {
            await axios.get(`${API_URL}/notifications`, {
                headers: { Cookie: `accessToken=${token}` }
            });
            console.log(`Notifications took ${Date.now() - notifStart}ms`);
        } catch (e) {
            console.log(`Notifications failed after ${Date.now() - notifStart}ms: ${e.message}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

testPerformance();
