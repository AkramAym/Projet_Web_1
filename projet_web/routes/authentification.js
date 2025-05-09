import { response, Router } from "express";
import express from "express";
import mongocon from '../mongodb.js';
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");
const notificationCollection = mongocon.db("MangathequeBD").collection("notification");

// Route pour afficher la page d'inscription
routeur.get('/inscription', (req, res) => {
    if (req.session.user?.identifiant) {
        return res.redirect("/profil");
    }
    res.render('pages/inscription', {
        message: null
    });
});
// Route pour gérer l'inscription (POST)
routeur.post("/inscription", async function (req, res) {
    console.log(req.body);
    const { identifiant, prenom, nom, email, telephone, mot_de_passe, motDePasseConfirme } = req.body;
    try {
        const utilisateurExiste = await utilisateurCollection.findOne({
            $or: [{ email: email }, { identifiant: identifiant }]
        });

        if (utilisateurExiste) {
            if (utilisateurExiste.email === email) {
                throw new Error('Email déjà utilisé');
            } else if (utilisateurExiste.identifiant === identifiant) {
                throw new Error('Identifiant déjà utilisé');
            }
        } else if (mot_de_passe !== motDePasseConfirme) {
            throw new Error('Les mots de passe ne correspondent pas');
        } else {
            const motDePasseEncrypte = bcrypt.hashSync(mot_de_passe, 10);
            const newUser = {
                identifiant: identifiant,
                nom: nom,
                prenom: prenom,
                mot_de_passe: motDePasseEncrypte,
                email: email,
                telephone: telephone || null,
                solde: 0,
                role: "client"
            };

            await utilisateurCollection.insertOne(newUser);

            req.session.user = { identifiant: identifiant };
            return res.redirect("/");
        }
    } catch (error) {
        console.log(error);
        return res.render('pages/inscription', {
            message: error.message || 'Erreur lors de l\'inscription'
        });
    }
});

// Route pour afficher la page de connexion
routeur.get('/connexion', (req, res) => {
    if (req.session.user?.identifiant) {
        return res.redirect("/profil");
    }
    res.render('pages/connexion', {
        message: null
    });
});

// Route pour gerer la connexion
routeur.post("/connexion", async function (req, res) {
    const { identifiant, mot_de_passe } = req.body;
    try {
        const utilisateur = await utilisateurCollection.findOne({ identifiant: identifiant })

        if (!utilisateur) {
            throw new Error('Identifiant inexistant')
        }
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        if (!motDePasseValide) {
            throw new Error('Mot de passe invalide');
        } else {
            req.session.user = {
                identifiant: identifiant,
                role: utilisateur.role || client
            };
            res.redirect('/profil');
            console.log(utilisateur);
        }
    } catch (error) {
        console.log(error);
        return res.render('pages/connexion', {
            message: error.message || 'Erreur lors de la connexion'
        });
    }
});

//Route pour afficher le profil de l'utilisateur
routeur.get('/profil', async function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    console.log("profil");
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    try {
        const identifiant = req.session.user.identifiant;
        const utilisateur = await utilisateurCollection.findOne({ identifiant: identifiant });

        if (!utilisateur) {
            throw new Error('Utilisateur non trouvé');
        }

        if (!req.session.adresseTemp && utilisateur.adresse) {
            req.session.adresseTemp = utilisateur.adresse;
        }

        if (utilisateur.solde == null){
            utilisateur.solde = 0;
        }
        res.render("pages/profil", {
            utilisateur: utilisateur,
            connecte: true
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/connexion");
    }
});

//Route pour afficher les notifications de l'utilisateur
routeur.get('/notifications', async function (req, res) {
    const identifiant = req.session.user.identifiant;
    if (!identifiant) {
        return res.redirect("/connexion");
    }
    try{
        const notifications = await notificationCollection.find({utilisateur_identifiant: identifiant })
        .sort({ date: -1})
        .toArray();

        res.render('pages/notifications', {
            notifications,
            connecte: true
        });
    }
    catch (err) {
        console.log("Erreur route GET /notifications:", err);
        res.render("pages/erreur", {
            message: "Erreur serveur, veuillez réessayer plus tard",
            connecte: true
        });
    }
});

routeur.post('/notifications/marquer-toutes-lues', async function (req, res) {
    const identifiant = req.session.user.identifiant;
    try{
        await notificationCollection.updateMany(
            { utilisateur_identifiant : identifiant},
            {$set: {lu : true}}
        );
        res.redirect('/notifications');
    }
    catch (err) {
        console.log("Erreur route POST /notifications/marquer-toutes-lues:", err);
        res.render("pages/erreur", {
            message: "Erreur serveur, veuillez réessayer plus tard",
            connecte: true
        });
    }
});

routeur.post('/notifications/:id/lue', async function (req, res) {
    const identifiant = req.session.user.identifiant;
    const idNotif = req.params.id;
    try {
        await notificationCollection.updateOne(
            {_id: new ObjectId(idNotif),
            utilisateur_identifiant: identifiant},
            {$set: {lu : true}}
    );

    res.redirect('/notifications');
    } catch (err) {
        console.log("Erreur route POST /notifications/:id/lue:", err);
        res.render("pages/erreur", {
            message: "Erreur serveur, veuillez réessayer plus tard",
            connecte: true
        });
    }
});


//Route pour deconnecter l'utilisateur
routeur.get('/deconnexion', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.log(err);
                return res.redirect('/profil');
            }
            res.clearCookie('connect.sid'); //Supprime le cookie stocke dans le navigateur
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

export default routeur;