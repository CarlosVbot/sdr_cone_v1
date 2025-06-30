document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://sdr-cone-v1.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Error: ${data.message || 'Credenciales inválidas'}`);
            return;
        }

        console.log('Token:', data.token);
        alert('Inicio de sesión exitoso');

        localStorage.setItem('token', data.token);

        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Error en login:', error);
        alert('Hubo un error al iniciar sesión');
    } });
