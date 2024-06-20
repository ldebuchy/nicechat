const displayUsers = async () => {
    $('#output').empty(); // Vider le contenu avec jQuery

    try {
        const response = await fetch(`/api/users`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });

        if (response.ok) {
            const users = await response.json();
            users.forEach(user => {
                $('#output').append(`
                    <div class="user">
                        <p><b>${user.username} </b>${user.external ? '(externe)' : ''}<br>${user._id}</p>
                        <button class="btn-danger del-user-btn" data-id="${user._id}">Supprimer</button>
                    </div>
                `);
            });
        } else {
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }
    } catch (error) {
        console.error('Une erreur est survenue :', error.message);
        $('#output').html(`<p class='display-error'>Une erreur est survenue lors de la récupération des utilisateurs.</p>`);
    }
}

const delUser = async (id) => {
    try {
        const response = await fetch(`/api/user/${id}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'utilisateur');
        }
        displayUsers();
    } catch (error) {
        console.error('Une erreur est survenue lors de la suppression de l\'utilisateur :', error.message);
    }
}

// Utiliser la délégation d'événements pour gérer les boutons de suppression dynamiquement ajoutés
$('#output').on('click', '.del-user-btn', function() {
    const userId = $(this).data('id');
    // Demande si l'utilisateur veut vraiment supprimer l'utilisateur
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
        delUser(userId);
    }
});

displayUsers();
