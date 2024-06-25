document.addEventListener('DOMContentLoaded', function() {
    var currentWorkspaceID = window.location.pathname.split('/')[2];
    var currentChannelID = window.location.pathname.split('/')[3];
    var currentChannelLastMessageDate = null;
    var currentChannelMessages = [];
    var currentChannelMembers = [];
    
    // Function to load content based on the page
    async function loadPage(page) {
        console.log("load", page);
        
        currentWorkspaceID = page.split('/')[2];
        currentChannelID = page.split('/')[3];
        currentChannelLastMessageDate = null;
        currentChannelMessages = [];
        currentChannelMembers = [];
            
        const token = localStorage.getItem('token');
        let user = {};
        let workspaces = [];

        const loadUserInfo = async () => {
            // On récupère les informations de l'utilisateur
            const response = await fetch('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                user = await response.json();
                
                // On affiche les informations de l'utilisateur
                document.getElementById('user_info').innerHTML = `
                    <p>${user.username}</p>
                `;
            } else { // Si le token est invalide, on redirige vers la page de login
                console.error(response);
                alert('Une erreur est survenue lors de la récupération des informations de votre compte');
                window.location.href = '/logout';
            }
        }

        const loadWorkspaces = async () => {
            // On récupère les workspaces de l'utilisateur
            const response = await fetch('/api/workspaces', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                workspaces = await response.json();

                // On vide la liste des workspaces
                document.getElementById('workspace_icons').innerHTML = ``;

                try {
                    // On ajoute les workspaces de l'utilisateur
                    workspaces.forEach(workspace => {
                        let html = `
                            <div class="workspace" id="${workspace._id}">
                                <div class="workspace_select">
                                </div>
                                <div class="wsicon" style="background: linear-gradient(120deg, ${workspace.icon_color}, var(--blue));">
                                    <p>${workspace.name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0,4)}</p>
                                </div>
                            </div>
                        `;
                        document.getElementById('workspace_icons').innerHTML += html;
                    });

                    // On ajoute les écouteurs d'événements après que tous les éléments ont été rendus
                    setTimeout(() => {
                        workspaces.forEach(workspace => {
                            if (workspace._id === currentWorkspaceID) {
                                document.getElementById(workspace._id).classList.add('selected');
                                document.getElementById(workspace._id).querySelector('.workspace_select').classList.add('selected');
                            }
                            
                            document.getElementById(workspace._id).addEventListener('click', () => {
                                history.pushState({}, '', `/channels/${workspace._id}/${workspace.channels[0]._id}`);
                                loadPage(`/channels/${workspace._id}/${workspace.channels[0]._id}`);
                                return;
                            });
                        });
                    }, 0);
                } catch (error) { 
                    console.error(error);
                }

                document.getElementById('workspace_icons').innerHTML += `
                    <div class="separator"></div>
                    <div id="add_workspace" class="wsicon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z" class=""></path></svg>
                    </div>
                `;
                // Ajoutez l'écouteur d'événements ici, après avoir ajouté le nouveau bouton au DOM
                document.getElementById('add_workspace').addEventListener('click', async () => {
                    // On enlève le clic pour éviter les doublons
                    
                    const workspace_name = prompt('Nom du workspace');
                    if (workspace_name) {
                        const response = await fetch('/api/workspace', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ name: workspace_name })
                        });
                        if (response.ok) {
                            workspaces = await response.json();
                            history.pushState({}, '', `/channels/${workspaces._id}`);
                            loadPage(`/channels/${workspaces._id}`);
                            return;
                        } else {
                            alert('Une erreur est survenue lors de la création du workspace');
                        }
                    }
                });
            } else {
                console.error(response);
                alert('Une erreur est survenue lors de la récupération des workspaces');
            }
        }

        const loadWorkspace = async (currentWorkspaceID) => {
            
            await loadUserInfo();
            
            if (!currentWorkspaceID) {
                if (workspaces.length > 0) {
                    currentWorkspaceID = workspaces[0]._id;
                } else {
                    return;
                }
            }

            
            // On récupère les informations du workspace
            const response = await fetch(`/api/workspace/${currentWorkspaceID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.ok) {
                console.error(response);
                
                history.pushState({}, '', `/channels`);
                loadPage('/channels');
                return;

            } else {
                const workspace = await response.json();

                if (!currentChannelID) {
                    currentChannelID = workspace.channels[0]._id;
                    history.pushState({}, '', `/channels/${currentWorkspaceID}/${currentChannelID}`);
                    loadPage(`/channels/${currentWorkspaceID}/${currentChannelID}`);
                    return;
                }
                
                document.title = `Nicechat - #${workspace.channels.find(channel => channel._id === currentChannelID).name} (${workspace.name})`;

                // Le header
                document.getElementById('workspace_name').innerHTML = workspace.name;

                document.getElementById('channels_header_options').innerHTML = '';
                document.getElementById('channels_header_options').innerHTML += '<svg id="invite" class="icon" aria-hidden="true"  xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM16.62 13.17c-.22.29-.65.37-.92.14-.34-.3-.7-.57-1.09-.82-.52-.33-.7-1.05-.47-1.63.11-.27.2-.57.26-.87.11-.54.55-1 1.1-.92 1.6.2 3.04.92 4.15 1.98.3.27-.25.95-.65.95a3 3 0 0 0-2.38 1.17ZM15.19 15.61c.13.16.02.39-.19.39a3 3 0 0 0-1.52 5.59c.2.12.26.41.02.41h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5a7.5 7.5 0 0 1 13.19-4.89ZM9.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.5 22Z" class=""></path><path fill="currentColor" d="M19 14a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z" class=""></path></svg>';
                if (workspace.owner_id === user._id) {
                    document.getElementById('channels_header_options').innerHTML += '<svg id="add_channel" class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 22 22"><path fill="currentColor" d="M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z" class=""></path></svg>';
                    document.getElementById('channels_header_options').innerHTML += '<svg id="delete_workspace" class="icon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z" class=""></path><path fill="currentColor" fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd" class=""></path></svg>';
                } else {
                    document.getElementById('channels_header_options').innerHTML += '<svg id="leave" class="icon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9 12a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z" class=""></path><path fill="currentColor" fill-rule="evenodd" d="M2.75 3.02A3 3 0 0 1 5 2h10a3 3 0 0 1 3 3v7.64c0 .44-.55.7-.95.55a3 3 0 0 0-3.17 4.93l.02.03a.5.5 0 0 1-.35.85h-.05a.5.5 0 0 0-.5.5 2.5 2.5 0 0 1-3.68 2.2l-5.8-3.09A3 3 0 0 1 2 16V5a3 3 0 0 1 .76-1.98Zm1.3 1.95A.04.04 0 0 0 4 5v11c0 .36.2.68.49.86l5.77 3.08a.5.5 0 0 0 .74-.44V8.02a.5.5 0 0 0-.32-.46l-6.63-2.6Z" clip-rule="evenodd" class=""></path><path fill="currentColor" d="M15.3 16.7a1 1 0 0 1 1.4-1.4l4.3 4.29V16a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1h-6a1 1 0 1 1 0-2h3.59l-4.3-4.3Z" class=""></path></svg>';
                }

                // Les channels
                document.getElementById('channels').innerHTML = ``;
                document.getElementById('channels').scrollTop = 0
                
                workspace.channels.forEach(channel => {

                    html = `
                            <div class="channel" id="${channel._id}">
                                <div class="channel_name">
                                    <svg x="0" y="0" class="hashtag" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>
                                    <p>${channel.name}</p>
                                </div>
                                 <div class="channel_options">
                                </div>
                            </div>
                        `;
                    
                    document.getElementById('channels').innerHTML += html;

                    // Attendre que le channel soit rendu avant d'ajouter l'écouteur d'événements
                    setTimeout(() => {
                        if (channel._id === currentChannelID) {
                            document.getElementById(channel._id).classList.add('selected');
                            document.getElementById('channel_title').innerHTML = channel.name;
                        }
                        if (workspace.owner_id === user._id) {
                            document.getElementById(channel._id).querySelector('.channel_options').innerHTML += `
                                <svg class="icon channel_icon delete_channel" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z" className=""></path><path fill="currentColor" fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd" className=""></path></svg>
                            `;
                                
                            document.getElementById(channel._id).querySelector('.delete_channel').addEventListener('click', async () => {
                                if (confirm(`Voulez-vous vraiment supprimer le channel "${channel.name}" ?`)) {
                                    const response = await fetch(`/api/workspace/${currentWorkspaceID}/${channel._id}`, {
                                        method: 'DELETE',
                                        headers: {Authorization: `Bearer ${token}`}
                                    });
                                    if (response.ok) {
                                        window.location.href = `/channels/${currentWorkspaceID}`;
                                    } else {
                                        alert('Une erreur est survenue lors de la suppression du channel');
                                    }
                                }
                            });
                        }
                    }, 0);
                });

                // Les membres
                document.getElementById('members').innerHTML = ``;
                workspace.members.forEach(member => {
                    // On, récupère le nom du membre via l'api
                    fetch(`/api/user/${member}` , {headers: { Authorization: `Bearer ${token}` }})
                        .then(response => response.json())
                        .then(member => {
                            currentChannelMembers.push(member);
                            
                            if (document.getElementById(member._id)) {
                                return;
                            }
                            
                            let memberclass = 'member';
                            let membericon = '';
                            
                            if (workspace.owner_id === member._id) { // Si le membre est le propriétaire du workspace
                                memberclass += ' owner';
                                membericon = `
                                    <svg class="ownericon" aria-hidden="false" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M5 18a1 1 0 0 0-1 1 3 3 0 0 0 3 3h10a3 3 0 0 0 3-3 1 1 0 0 0-1-1H5ZM3.04 7.76a1 1 0 0 0-1.52 1.15l2.25 6.42a1 1 0 0 0 .94.67h14.55a1 1 0 0 0 .95-.71l1.94-6.45a1 1 0 0 0-1.55-1.1l-4.11 3-3.55-5.33.82-.82a.83.83 0 0 0 0-1.18l-1.17-1.17a.83.83 0 0 0-1.18 0l-1.17 1.17a.83.83 0 0 0 0 1.18l.82.82-3.61 5.42-4.41-3.07Z" class=""></path></svg>
                                `;
                            }
                            
                            if (member._id === user._id) { // Si le membre est l'utilisateur actuel, on le met en surbrillance
                                memberclass += ' current_user';
                            }
                            
                            const html = `
                                    <div class="${memberclass}" id="${member._id}">
                                        <p>${member.username}</p>
                                        ${membericon}
                                    </div>
                                `;
                            
                            // Si le membre est l'utilisateur actuel, on l'ajoute tout en premier (pour plaire à son ego)
                            if (member._id === user._id) {
                                document.getElementById('members').innerHTML = html + document.getElementById('members').innerHTML;
                            } else {
                                document.getElementById('members').innerHTML += html;
                            }
                            
                        });
                });

                // L'envoie de message
                document.getElementById('chat_input').innerHTML = `
                    <textarea id="message_input" autofocus placeholder="Message"></textarea>
                `;
                document.getElementById('message_input').focus();
                
                // Les écouteurs d'événements
                
                // Quand on appuie sur entrée dans la textarea pour envoyer un message
                document.getElementById('message_input').addEventListener('keydown', async (event) => {

                    if (event.key === 'Enter' && event.shiftKey) {
                        event.preventDefault();
                        // on implémentera la possibilité de faire un retour à la ligne avec shift + entrée
                    } else if (event.key === 'Enter' && event.target.value.trim() !== '') { // Si la touche appuyée est "Entrée"
                        event.preventDefault();
                        const response = await fetch(`/api/message/${currentWorkspaceID}/${currentChannelID}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                message: event.target.value,
                                parent_id: null,
                                workspace_id: currentWorkspaceID,
                                channel_id: currentChannelID
                            })
                        });
                        if (response.ok) {
                            event.target.value = '';
                            event.target.rows = 1;
                            console.log('Message envoyé:', await response.json());
                            await refreshMessages(currentWorkspaceID, currentChannelID);
                        } else {
                            alert('Une erreur est survenue lors de l\'envoie du message');
                        }
                    }
                    document.getElementById('message_input').hasEventListener = true;
                });
                
                // Ajouter un channel
                if (workspace.owner_id === user._id) {
                    document.getElementById('add_channel').addEventListener('click', async () => {
                        const channel_name = prompt('Entrez le nom du channel. Seuls les caractères alphanumériques minuscule et les tirets sont autorisés.');
                        if (channel_name) {
                            const response = await fetch(`/api/workspace/${currentWorkspaceID}/channel`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ name: channel_name })
                            });
                            if (response.ok) {
                                let newchannel = await response.json();
                                newchannel = newchannel.channels[newchannel.channels.length - 1];
                                history.pushState({}, '', `/channels/${currentWorkspaceID}/${newchannel._id}`);
                                loadPage(`/channels/${currentWorkspaceID}/${newchannel._id}`);
                                return;
                            } else {
                                alert('Une erreur est survenue lors de la création du channel');
                            }
                        }
                    });
                    
                    // Supprimer le workspace
                    document.getElementById('delete_workspace').addEventListener('click', async () => {
                        if (confirm(`Voulez-vous vraiment supprimer le workspace ? Une fois supprimé, il ne pourra pas être récupéré.`)) {
                            const response = await fetch(`/api/workspace/${currentWorkspaceID}`, {
                                method: 'DELETE',
                                headers: {Authorization: `Bearer ${token}`}
                            });
                            if (response.ok) {
                                window.location.href = '/channels';
                                
                            } else {
                                alert('Une erreur est survenue lors de la suppression du workspace');
                            }
                        }
                    });
                } else {
                    // Quitter le workspace
                    document.getElementById('leave').addEventListener('click', async () => {
                        if (confirm(`Voulez-vous vraiment quitter le workspace "${workspace.name}" ?`)) {
                            const response = await fetch(`/api/workspace/${currentWorkspaceID}/leave`, {
                                method: 'POST',
                                headers: {Authorization: `Bearer ${token}`}
                            });
                            if (response.ok) {
                                window.location.href = '/channels';
                            } else {
                                alert('Une erreur est survenue lors de la suppression du workspace');
                            }
                        }
                    });
                }
                
                /// Inviter des membres
                document.getElementById('invite').addEventListener('click', async () => {
                    const invite = prompt('Invitez des membres en partageant ce lien:', `${window.location.origin}/invite/${workspace.workspace_code}`);
                });

                let channels = document.getElementsByClassName('channel');
                for (let i = 0; i < channels.length; i++) {
                    channels[i].addEventListener('click', () => {
                        let url = `/channels/${currentWorkspaceID}/${channels[i].id}`;
                        history.pushState({}, '', url);
                        loadPage(url);
                        return;
                    });
                }
                
                // Voir les membres
                document.getElementById('view_members').addEventListener('click', () => {
                    if (document.getElementById('chat_members').style.display === 'none') {
                        document.getElementById('chat_members').style.display = 'block';
                    } else {
                        document.getElementById('chat_members').style.display = 'none';
                    }
                });
                
            }
        }

        // Fonction pour obtenir le nombre de messages du serveur
        const getLastMessage = async (workspaceID, channelID) => {
            const response = await fetch(`/api/message/${workspaceID}/${channelID}/last`, {
                headers: { Authorization: `Bearer ${token}` } // Remplacez 'token' par votre token actuel
            });
            const data = await response.json();
            return data.data;
        }
        
        const displayMessages = (messages) => {
            // On affiche les messages
            currentChannelMessages.forEach(message => {

                let author = "message_author"
                if (message.user_id === user._id) {
                    author = "message_author author_current_user";
                }

                let html = `
                    <div class="message" id="${message._id}">
                        <div class="message_info">
                            <p id="${message.user_id}" class="${author}">${currentChannelMembers.find(member => member._id === message.user_id).username}</p>
                            <p class="message_date">${new Date(message.created_at).toLocaleString()}</p>
                        </div>
                        <div class="message_content">
                            <p>${message.content}</p>
                        </div>
                    </div>
                `;
                
                // On regarde si le message précédent dans messages est du même auteur
                if (currentChannelMessages.indexOf(message) > 0) {
                    if (message.user_id === currentChannelMessages[currentChannelMessages.indexOf(message) - 1].user_id) {
                        // on insère le message dans le message précédent une ligne en dessous
                        document.getElementsByClassName('message_content')[document.getElementsByClassName('message_content').length - 1].innerHTML += `<p>${message.content}</p>`;
                        
                    } else {
                        document.getElementById('messages').innerHTML += html;
                    }
                } else {
                    document.getElementById('messages').innerHTML += html;
                }

                
                
            });
            // On scroll en bas de la liste des messages
            document.getElementById('messages_zone').scrollTop = document.getElementById('messages_zone').scrollHeight;
        }
        
        // Fonction pour rafraîchir les messages
        const refreshMessages = async (currentWorkspaceID, currentChannelID, start, end) => {
            if (!start) {
                start = 0;
            }
            if (!end) {
                end = await getLastMessage(currentWorkspaceID, currentChannelID);
            }
            // Mettez ici votre logique pour rafraîchir les messages
            const response = await fetch(`/api/message/${currentWorkspaceID}/${currentChannelID}?start=${start}&end=${end}`, {
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
            });
            const messages = await response.json();
            currentChannelMessages = messages.data;
            console.log('Nouveau message récupéré:', currentChannelMessages);
            document.getElementById('messages').innerHTML = '';
            displayMessages(currentChannelMessages);
        }

        // Fonction pour vérifier le nombre de messages
        const checkLastMessageDate = async (currentWorkspaceID, currentChannelID) => {
            const serverLastMessageDate = await getLastMessage(currentWorkspaceID, currentChannelID);
            if (serverLastMessageDate !== currentChannelLastMessageDate) {
                console.log('Rafraîchissement des messages...');
                currentChannelLastMessageDate = serverLastMessageDate;
                await refreshMessages(currentWorkspaceID, currentChannelID);
            }
        }
        
        
        
        // Éxécution

        if (window.location.search === '?invited=true') {
            // Attend 1 seconde avant d'afficher l'alerte
            setTimeout(() => alert('Vous avez rejoint le workspace avec succès.'), 500);
        }
        document.getElementById('message_input').focus();
        
        await loadWorkspaces();
        
        await loadWorkspace(currentWorkspaceID);
        
        // On rafraichis messages
        await refreshMessages(currentWorkspaceID, currentChannelID);
        
        // Boucle pour vérifier le nombre de messages et les rafraîchir si nécessaire
        setInterval(async () => {
            await checkLastMessageDate(currentWorkspaceID, currentChannelID);
        }, 1000);
        
    }

    // Gérer l'événement popstate pour la navigation avant/arrière
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.page) {
            loadPage(event.state.page);
            return;
        }
    });

    // Chargement de la page initiale en fonction de l'URL
    const initialPage = window.location.pathname;
    loadPage(initialPage);
    return;
});
