// On fait la requete asychrone fetch API matchInvite pouir faire rejoindre l'utilisateur à un workspace dont le code est dans l'url

const matchInvite = async () => {
    const url = window.location.href;
    const id = url.split('/').pop();
    
    const response = await fetch(`/api/invite/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    if (response.status === 200) {
        workspace = await response.json();
        window.location.href = '/channels/' + workspace._id + '?invited=true';
    } else {
        console.log('error');
        alert('Impossible de rejoindre ce workspace.');
    }
}

matchInvite();
