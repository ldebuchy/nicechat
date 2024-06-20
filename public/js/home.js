const title = document.getElementById('title');
const createBtn = document.getElementById('create-btn');

const formLine = (form) => {
    // Si le formulaire est partagé, on affiche le bouton pour voir les réponses sinon on affiche le bouton pour modifier
    
    return `
        <div class="form">
            <h4>${form.name}</h4>
            <p>${form.share_at ? `Partagé le ${new Date(form.share_at).toLocaleDateString()}` : 'Non partagé'}</p>
            <div class="form-link">
            ${form.share_at ? `<a href="/form?id=${form._id}" target="_blank">Lien</a>` : ''}
            ${form.share_at == null ? `<button class="btn" onclick="window.location.href='/editor?id=${form._id}'">Modifier</button>` : `<button class="btn" onclick="window.location.href='/responses?id=${form._id}'">Voir les réponses</button>`}
                <button class="btn btn-danger del-form-btn" data-id="${form._id}">Supprimer</button>
            </div>
        </div>
            `
}

const displayForms = async () => {
    $('#output').empty(); // Vider le contenu avec jQuery

    try {
        // On récupère les id de formulaires de l'utilisateur
        const response = await fetch('/api/user', {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des formulaires');
        }
        const user = await response.json();
        // On récupère les formulaires
        const forms = user.forms;
        for (const formId of forms) {
            const response = await fetch(`/api/form/${formId}`, {
                headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération d\'un formulaire');
            }
            const form = await response.json();
            $('#output').append(formLine(form));
        }
    }
    catch (error) {
        console.error('Une erreur est survenue lors de la récupération des formulaires :', error.message);
    }
}

const createForm = async () => {
    try {
        const response = await fetch('/api/form', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la création du formulaire');
        }
        const form = await response.json();
        window.location.href = `/editor?id=${form._id}`;
    } catch (error) {
        console.error('Une erreur est survenue lors de la création du formulaire :', error.message);
    }
}

const delForm = async (id) => {
    try {
        const response = await fetch(`/api/form/${id}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'utilisateur');
            alert('Erreur lors de la suppression du formulaire');
        }
        // On enlève le formulaire de la liste des formulaires affichés
        $(`[data-id=${id}]`).parent().parent().remove();
        
    } catch (error) {
        console.error('Une erreur est survenue lors de la suppression de l\'utilisateur :', error.message);
        alert('Erreur lors de la suppression du formulaire');
    }
}

// Récupérer l'utilisateur connecté
const getTitle = async () => {
    try {
        const response = await fetch('/api/user', {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'utilisateur');
        }
        const user = await response.json();
        title.textContent = `Bienvenue ${user.firstname}`;
    } catch (error) {
        console.error('Une erreur est survenue lors de la récupération de l\'utilisateur :', error.message);
    }
}

// Utiliser la délégation d'événements pour gérer les boutons de suppression dynamiquement ajoutés
$('#output').on('click', '.del-form-btn', function() {
    const formId = $(this).data('id');
    // Demande si l'utilisateur veut vraiment supprimer l'utilisateur
    if (confirm('Voulez-vous vraiment supprimer ce formulaire ?')) {
        delForm(formId);
    }
});

createBtn.addEventListener('click', createForm);

getTitle();
displayForms();
