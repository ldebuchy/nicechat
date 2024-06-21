const mongoose = require('mongoose');

// Définition du sous-schéma pour les canaux
const channelSchema = mongoose.Schema({
    name: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
});

// Définition du schéma pour les espaces de travail
const workspaceSchema = mongoose.Schema({
    icon_color: {type: String, required: true},
    name: {type: String, required: true},
    workspace_code: {type: String, required: false},
    created_at: {type: Date, default: Date.now},
    owner_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    channels: [channelSchema]
});

module.exports = mongoose.model('Workspaces', workspaceSchema);
