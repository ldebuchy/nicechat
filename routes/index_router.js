const express = require('express');
const router = express.Router();
const display = require('../controllers/index_controller');

router.get('/', display.home);

module.exports = router;
