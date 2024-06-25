const User = require('../../models/user_model');
const Workspace = require('../../models/workspace_model');
const Message = require('../../models/message_model');
require('dotenv').config();

const ADMIN_ID = process.env.ADMIN_ID; // récupération de l'ID de l'administrateur

const createWorkspace = async (req, res) => {
    try {
        const workspace = new Workspace(req.body);
        workspace.owner_id = req.user._id;
        workspace.members.push(req.user._id);
        
        // Générer un code unique d'invitation pour l'espace de travail
        let workspace_code;
        do {
            workspace_code = Math.random().toString(36).substring(2, 10);
        } while (await Workspace.findOne({workspace_code}));
        workspace.workspace_code = workspace_code;
        
        // Assigner la couleur de l'icône par défaut
        workspace.icon_color = req.body.icon_color || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        
        // Générer un canal par défaut
        workspace.channels.push({name: 'information'});
        workspace.channels.push({name: 'general'});
        workspace.channels.push({name: 'hors-sujet'});
        
        
        // Ajouter le workspace à l'utilisateur
        const user = await User.findById(req.user._id);
        user.workspaces.push(workspace._id);
        await user.save();
        
        await workspace.save();
        res.status(201).send(workspace);
    } catch (error) {
        res.status(400).send(error);
    }
}
        
const getWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id);
        if (!workspace) {
            return res.status(404).send();
        }
        res.send(workspace);
    } catch (error) {
        res.status(500).send(error);
    }
}

const getUserWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({members: req.user._id});
        // On envoie seulement l'id, le nom et la couleur de l'icône
        workspaces.forEach(workspace => {
            workspace.workspace_code = undefined;
            workspace.created_at = undefined;
            workspace.owner_id = undefined;
            workspace.members = undefined;
            workspace.__v = undefined;
        });
        res.send(workspaces);
    } catch (error) {
        res.status
    }
}

const updateWorkspace = async (req, res) => {
    const _id = req.params.id;

    Workspace.findByIdAndUpdate(_id, req.body, {new: true}).then((workspace) => {
        if (!workspace) {
            return res.status(404).send();
        }
        res.send(workspace);
    }).catch((error) => {
        res.status(500).send(error);
    });
}

const addChannel = async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
        return res.status(404).send();
    }
    
    // On vérifie si l'utilisateur est membre du workspace
    if (!workspace.members.includes(req.user._id)) {
        return res.status(403).send({error: "You are not a member of this workspace"});
    }
    
    req.body.name = req.body.name.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    
    workspace.channels.push(req.body);
    await workspace.save();
    
    res.send(workspace);
}

const leaveWorkspace = async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
        return res.status(404).send();
    }
    
    // On vérifie si l'utilisateur est le propriétaire
    if (workspace.owner_id.toString() === req.user._id.toString()) {
        return res.status(403).send({error: "You are the owner of this workspace. You can't leave it."});
    }
    
    // On supprime le workspace de la liste des workspaces de l'utilisateur
    const user = await User.findById(req.user._id);
    user.workspaces.pull(workspace._id);
    await user.save();
    
    // On supprime l'utilisateur de la liste des membres du workspace
    workspace.members.pull(req.user._id);
    await workspace.save();
    
    res.send(workspace);
}
    
const deleteWorkspace = async (req, res) => {
    
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
        return res.status(404).send();
    }
    
    // On vérifie si l'utilisateur est le propriétaire
    if (workspace.owner_id.toString() !== req.user._id.toString() && req.user._id !== ADMIN_ID) {
        return res.status(403).send({error: "You are not allowed to delete this workspace"});
    }
    
    // On supprime le workspace de la liste des workspaces de tout les membres
    const members = await User.find({workspaces: workspace._id});
    for (const member of members) {
        member.workspaces.pull(workspace._id);
        await member.save();
    }
    
    // On supprime le workspace
    Workspace.findByIdAndDelete(req.params.id).then((workspace) => {
        if (!workspace) {
            return res.status(404).send();
        }
        res.send(workspace);
    }).catch((error) => {
        res.status(500).send(error);
    });
    
}

const matchInviteCode = async (req, res) => {
    const workspace = await Workspace.findOne({workspace_code: req.params.id});
    
    if (!workspace) {
        return res.status(404).send();
    }
    
    // On vérifie si l'utilisateur est déjà membre du workspace
    if (workspace.members.includes(req.user._id)) {
        return res.send(workspace);
    }
    
    // On ajoute l'utilisateur à la liste des membres du workspace
    workspace.members.push(req.user._id);
    await workspace.save();
    
    // On ajoute le workspace à la liste des workspaces de l'utilisateur
    const user = await User.findById(req.user._id);
    await User.findById(req.user._id);
    user.workspaces.push(workspace._id);
    await user.save();
    
    res.send(workspace);
}

const deleteChannel = async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
        return res.status(404).send();
    }
    
    // On vérifie si l'utilisateur est le propriétaire
    if (workspace.owner_id.toString() !== req.user._id.toString() && req.user._id !== ADMIN_ID) {
        return res.status(403).send({error: "You are not allowed to delete a channel in this workspace"});
    }
    
    workspace.channels.pull(req.params.channelId);
    await workspace.save();
    
    await Message.deleteMany({channel_id: req.params.channelId, workspace_id: req.params.id});
    
    res.send(workspace);
}

module.exports = {createWorkspace, getWorkspace, getUserWorkspaces, updateWorkspace, addChannel, leaveWorkspace, deleteWorkspace, matchInviteCode, deleteChannel};
