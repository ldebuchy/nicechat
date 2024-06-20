// Ajoute un écouteur d'événement sur le formulaire
document.querySelector('form').addEventListener('submit', async (event) => {

    // On désactive le bouton de soumission du formulaire
    event.target.querySelector('input[type="submit"]').disabled = true;
    event.target.querySelector('input[type="submit"]').value = 'Connexion en cours...';
    // Empêche l'envoi du formulaire
    event.preventDefault();

    const formData = new FormData(event.target); // Récupère les données du formulaire

    // Envoie les données du formulaire au serveur
    const response = await fetch(event.target.action, {
        method: event.target.method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData))
    });

    // Si la requête a réussi ou si l'utilisateur est déjà connecté
    if (response.ok) {

        // Récupère le token et le stocke dans le localStorage
        localStorage.setItem('token', await response.json().then(data => data.token));

        // Récupérer l'URL de redirection depuis le localStorage, le supprimer et rediriger l'utilisateur
        const redirectUrl = localStorage.getItem('redirectUrl');
        localStorage.removeItem('redirectUrl');
        window.location.href = redirectUrl || '/'; // si redirectUrl est null, redirige vers la page d'accueil
    } else {
        // Affiche un message d'erreur
        const error = await response.json();
    }

    // On réactive le bouton de soumission du formulaire
    event.target.querySelector('input[type="submit"]').disabled = false;
    event.target.querySelector('input[type="submit"]').value = 'Se connecter';

});
