fetch('/auth/logout', {
    method: 'POST',
    headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
}
}).then(response => {
    if (response.ok) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
    window.location.href = '/';
}, 1000);
}
})
