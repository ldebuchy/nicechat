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

router.post('/workspace', auth, ws.createWorkspace); // create a new workspace
router.get('/workspace/:id', auth, ws.getWorkspace); // get a workspace
router.put('/workspace/:id', auth, ws.updateWorkspace); // update a workspace
router.delete('/workspace/:id', auth, ws.deleteWorkspace); // delete a workspace

module.exports = router;
