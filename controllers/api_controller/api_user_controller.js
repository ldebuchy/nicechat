const User = require('../../models/user_model');
require('dotenv').config();

const COMPANY_DOMAIN = process.env.COMPANY_DOMAIN; // récupération de la liste des domaines autorisés
const ADMIN_ID = process.env.ADMIN_ID; // récupération de l'ID de l'administrateur

const getUser = (req, res) => {
    // si un paramètre est passé dans la requête, on récupère l'utilisateur correspondant sinon on récupère l'utilisateur connecté
    const _id = req.params.id || req.user._id;
    
    // on tient compte dui cas ou l'utilisateur n'existe pas
    User.findById(_id).then((user) => {
        if (!user) {
            return res.status(404).send();
        }
        // on supprime les informations sensibles et inutiles
        if (req.user._id !== _id) { // si l'utilisateur n'est pas le propriétaire du compte on envoie pas ces informations
            user.email = undefined;
            user.workspaces = undefined;
        }
        user.password = undefined;
        user.created_at = undefined;
        user.__v = undefined;
        
        // On envoie ces informations uniquement si l'utilisateur est le propriétaire du compte
        
        res.send(user);
    }).catch((error) => {
        res.status(500).send(error);
    });
}

const getAllUsers = (req, res) => {
    User.find().then((users) => {
        // on supprime les informations sensibles et inutiles
        users.forEach(user => {
            user.email = undefined;
            user.password = undefined;
            user.workspaces = undefined;
            user.created_at = undefined;
            user.__v = undefined;
        });
        
        res.status(200).send(users);
    }).catch((error) => {
        res.status(500).send(error);
    });
}

const update = (req, res) => {
    const _id = req.params.id || req.user._id;
    
    if (req.body.password && req.body.password.length < 8) {
        return res.status(400).send({message: 'Password must be at least 8 characters long'});
    }
    
    // si le domaine de l'email n'est pas contenue dans la liste des domaines autorisés, l'utilisateur est définie comme externe
    const domain = req.body.email.split('@')[1];
    req.body.external = !COMPANY_DOMAIN.split(',').includes(domain);
    
    User.findByIdAndUpdate(_id, req.body, {new: true}).then((user) => {
        if (!user) {
            return res.status(404).send();
        }
        // récupération de l'utilisateur mis à jour
        User.findById(_id).then((user) => {
            res.send(user);
        }).catch((error) => {
            res.status(500).send(error);
        });
    }).catch((error) => {
        res.status(500).send(error);
    });
}

const deleteUser = (req, res) => {
    const _id = req.params.id;
    if (req.user._id === _id || req.user._id === ADMIN_ID) {
        User.findByIdAndDelete(_id).then((user) => {
            if (!user) {
                return res.status(404).send();
            }
            res.send(user);
        }).catch((error) => {
            res.status(500).send(error);
        });
    } else {
        res.status(403).send({message: 'Unauthorized'});
    }
}

module.exports = {getUser, getAllUsers, deleteUser};
