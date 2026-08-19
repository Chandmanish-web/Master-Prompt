const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Manager One',
        email: 'manager1234@gmail.com',
        password: 'password123',
        role: 'manager',
      }),
    });

    const body = await response.text();
    console.log('Registration test response', response.status);
    console.log(body);
  } catch (error) {
    console.error('ERROR', error.message);
  }
})();
