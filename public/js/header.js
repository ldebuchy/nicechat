document.querySelector('header').innerHTML = `
<h1>
    <a href="/">Nicechat</a>
</h1>
<nav>
    <a href="/login">Se connecter</a>
    <a href="/register">S'inscrire</a>
</nav>
`;

const token = localStorage.getItem('token');

if (token && !window.location.href.includes('editor')) {
    fetch('/api/user', {
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    }).then(response => {
        if (response.ok) {
            response.json().then(user => {
                document.querySelector('nav').innerHTML = `
                    <a href="/">${user.username}</a>
                    <a href="/logout">Se déconnecter</a>
                `;
            });
        }
    });
}
