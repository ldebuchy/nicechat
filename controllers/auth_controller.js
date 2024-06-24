const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const bcrypt = require('bcrypt');
require('dotenv').config();

const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Trouver l'utilisateur par username ou email
        const user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) {
            // Attendre pour éviter les attaques par force brute
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(401).json({ message: 'User not found' });
        }

        // Comparer le mot de passe fourni avec le mot de passe chiffré stocké
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            // Attendre pour éviter les attaques par force brute
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(401).json({ message: 'Incorrect password' });
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
        
        // refuser si le nom d'utilisateur est trop court
        if (username.length < 3) {
            return res.status(400).json({ message: 'Username is too short' });
        }
        
        // refuser si le nom d'utilisateur contient des caractères autres que des lettres minuscules, des chiffres, des points et des backspace (espace non accepté pour éviter les problèmes de compatibilité avec les URL)
        if (!/^[a-z0-9._]+$/.test(username)) {
            return res.status(400).json({ message: 'Username can only contain lowercase letters, numbers, dots and backspaces' });
        }
        
        //refuser si l'email n'est pas valide
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        
        // refuser si le mot de passe est trop court
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password is too short' });
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
