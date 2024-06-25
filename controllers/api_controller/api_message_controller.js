const User = require('../../models/user_model');
const Workspace = require('../../models/workspace_model');
const Message = require('../../models/message_model');

const createMessage = async (req, res) => {
    const {workspaceId, channelId} = req.params;
    const content = req.body.message;
    const userId = req.user._id;
    const parentId = req.body.parent_id;
    
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({message: 'Workspace not found'});
        }

        const channel = workspace.channels.id(channelId);
        if (!channel) {
            return res.status(404).send({message: 'Channel not found'});
        }

        const message = new Message({
            content: content,
            user_id: userId,
            parent_id: parentId,
            channel_id: channelId,
            workspace_id: workspaceId,
        });

        await message.save();

        return res.status(201).send({message: 'Message created', data: message});
    } catch (error) {
        return res.status(500).send({message: error.message});
    }
}

getMessages = async (req, res) => {
    const {workspaceId, channelId} = req.params;
    let {start, end} = req.query;
    
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({message: 'Workspace not found'});
        }
        
        const channel = workspace.channels.id(channelId);
        if (!channel) {
            return res.status(404).send({message: 'Channel not found'});
        }
        
        
        if (!start) {
            start = 0;
        }
        if (!end) {
            end = await Message.countDocuments({channel_id: channelId, workspace_id: workspaceId});
        }

        let messages = [];
        
        // On récupère les messages trié par date situé entre les deux index
        messages = await Message.find({channel_id: channelId, workspace_id: workspaceId})
            .sort({created_at: 1})
            .skip(start)
            .limit(end - start);
        
        return res.status(200).send({data: messages});
    } catch (error) {
        return res.status(500).send({message: error.message});
    }
}

const getLastMessageDate = async (req, res) => {
    const {workspaceId, channelId} = req.params;
    
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({message: 'Workspace not found'});
        }
        
        const channel = workspace.channels.id(channelId);
        if (!channel) {
            return res.status(404).send({message: 'Channel not found'});
        }
        
        const message = await Message.find({channel_id: channelId, workspace_id: workspaceId})
            .sort({created_at: -1})
            .limit(1);
        
        if (message.length === 0) {
            return res.status(200).send({message: 'No message found'});
        }

        return res.status(200).send({data: message[0].created_at});
    } catch (error) {
        return res.status(500).send({message: error.message});
    }
}
        
module.exports = {createMessage, getMessages, getLastMessageDate};
