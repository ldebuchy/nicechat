const User = require('../../models/user_model');
require('dotenv').config();

const ADMIN_ID = process.env.ADMIN_ID; // récupération de l'ID de l'administrateur

const getUser = (req, res) => {
    // si un paramètre est passé dans la requête, on récupère l'utilisateur correspondant sinon on récupère l'utilisateur connecté
    const _id = req.params.id || req.user._id;
    
    // on tient compte dui cas ou l'utilisateur n'existe pas
    User.findById(_id).then((user) => {
        if (!user) {
            return res.status(404).send();
        }

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
    
    if (req.body.password) {
        delete req.body.password;
    }
    
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

module.exports = {getUser, getAllUsers, update, deleteUser};
