const mongoose = require('mongoose');

// Définition du schéma pour les espaces de travail
const messageSchema = mongoose.Schema({
    content: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    parent_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Messages'},
    channel_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Channels'},
    workspace_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspaces'},
});

module.exports = mongoose.model('Messages', messageSchema);
