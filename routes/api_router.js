const express = require('express');
const router = express.Router();
const user = require('../controllers/api_controller/api_user_controller');
const {auth} = require('../middleware/auth');

router.get('/user', auth, user.getUser); // get the current user
router.get('/users', auth, user.getAllUsers); // get all users

module.exports = router;
