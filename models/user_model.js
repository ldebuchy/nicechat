const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    workspaces: {type: Array, required: false},
    created_at: {type: Date, default: Date.now}
});

userSchema.pre('save', async function(next) {
    const user = this;
    
    if (!user.password || !user.isModified('password')) // si le mot de passe n'est pas modifié ou l'attribut n'existe pas, on passe à l'étape suivante
        return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('Users', userSchema);
