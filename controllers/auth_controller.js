const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const bcrypt = require('bcrypt');
require('dotenv').config();

const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Trouver l'utilisateur par username
        const user = await User.findOne({ username });
        if (!user) {
            // Attendre pour éviter les attaques par force brute
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Comparer le mot de passe fourni avec le mot de passe chiffré stocké
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            // Attendre pour éviter les attaques par force brute
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Si le mot de passe est correct, générer un token JWT
        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24h' });
        
        res.status(200).json({ message: 'User logged in', token, user: { _id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
    
const register = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Vérifier si l'utilisateur existe déjà
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Créer un nouvel utilisateur
        const newUser = new User({ username, email, password });
        await newUser.save();
        
        res.status(201).json({ message: 'User created' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const logout = (req, res) => {
    res.status(200).clearCookie('token').json({ message: 'User logged out' });
}
    
module.exports = {login, register, logout};
