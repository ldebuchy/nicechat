// Register form
document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const response = await fetch(event.target.action, {
            method: event.target.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        if (response.ok) {
            window.location.href = '/login?registered=true';
        } else {
            const error = await response.json();
            alert(error.message);
        }
    });

// Quand on entre un nom d'utilisateur, les espaces sont remplacés par des tiret vers le bas, les majuscules par des minuscules et les caractères spéciaux sont supprimés
document.getElementById('username').addEventListener('input', (event) => {
	event.target.value = event.target.value.replace(/ /g, '_').replace(/[^a-z0-9._]/g, '').toLowerCase();
});
