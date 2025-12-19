const fetch = require('node-fetch');

(async () => {
    try {
        const res = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alice@example.com', password: 'password123' })
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (err) {
        console.error(err);
    }
})();
