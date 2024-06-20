if (!localStorage.getItem('token')) {
    localStorage.setItem('redirectUrl', window.location.href);
    window.location.href = '/login';
} else {
    // Essaye de voir si le token est encore valide
    fetch('/api/user', {
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    }).then(response => {
        if (!response.ok) {
            localStorage.setItem('redirectUrl', window.location.href);
            window.location.href = '/login';
        }
    }).catch(error => {
        console.error(error);
        localStorage.setItem('redirectUrl', window.location.href);
        window.location.href = '/login';
    });
}
