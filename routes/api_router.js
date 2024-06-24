const express = require('express');
const router = express.Router();
const user = require('../controllers/api_controller/api_user_controller');
const ws = require('../controllers/api_controller/api_workspace_controller');
const {auth} = require('../middleware/auth');

router.get('/user', auth, user.getUser); // get the current user
router.get('/user/:id', auth, user.getUser); // get a user
router.get('/users', auth, user.getAllUsers); // get all users
router.put('/user/:id', auth, user.update); // update a user
router.delete('/user/:id', auth, user.deleteUser); // delete a user

// Workspaces
router.post('/workspace', auth, ws.createWorkspace); // create a new workspace
router.get('/workspace/:id', auth, ws.getWorkspace); // get a workspace
router.get('/workspaces', auth, ws.getUserWorkspaces); // get all workspaces of the current user
router.put('/workspace/:id', auth, ws.updateWorkspace); // update a workspace
router.post('/workspace/:id/leave', auth, ws.leaveWorkspace); // leave a workspace
router.delete('/workspace/:id', auth, ws.deleteWorkspace); // delete a workspace

// Channels
router.post('/workspace/:id/channel', auth, ws.addChannel); // add a channel to a workspace
router.delete('/workspace/:id/:channelId', auth, ws.deleteChannel); // delete a channel

router.get('/invite/:id', auth, ws.matchInviteCode); // invite a user to a workspace
    
module.exports = router;
