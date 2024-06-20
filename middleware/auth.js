const jwt = require('jsonwebtoken');
require('dotenv').config();

function auth(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    try {
        req.user = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = {auth};
