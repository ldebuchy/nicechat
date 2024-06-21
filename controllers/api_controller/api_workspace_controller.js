const User = require('../../models/user_model');
const Workspace = require('../../models/workspace_model');
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
        workspace.icon_color = req.body.icon_color || `#${Math.floor(Math.random()*16777215).toString(16)}`;
        
        // Générer un canal par défaut
        workspace.channels.push({name: 'general'});
        
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
        console.log(workspace);
        res.send(workspace);
    }).catch((error) => {
        res.status(500).send(error);
    });
    
}
    
module.exports = {createWorkspace, getWorkspace, updateWorkspace, deleteWorkspace};
