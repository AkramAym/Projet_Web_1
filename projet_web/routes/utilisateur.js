import { Router } from "express";
import express from "express";
import mysql from "mysql";
import bcrypt from "bcryptjs";

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "scott",
    password: "oracle",
    database: "MangathequeBD",
    charset: 'utf8mb4'
});
con.connect(function (err) {
    if (err) throw err;
    console.log("connected!");
});

// Route pour afficher la page d'inscription
routeur.get('/inscription', (req, res) => {
    res.render('pages/inscription', {
        message: null
    });
});

// Route pour afficher la page de connexion
routeur.get('/connexion', (req, res) => {
    res.render('pages/connexion');
});

routeur.post("/connexion", function (req, res) {
    const { identifiant, mot_de_passe } = req.body;

    con.query('SELECT identifiant, mot_de_passe FROM utilisateur WHERE identifiant = ?', [identifiant], (error, results) => {
        if (error) {
            console.log(error);
            throw error;
        }

        if (results.length <= 0) {
            return res.render('pages/connexion', {
                message: 'Identifiant inexistant'
            })
        } else {
            const mot_de_passeUtilisateur = results.mot_de_passe;
            if (mot_de_passe != mot_de_passeUtilisateur) {
                return res.render('pages/connexion', {
                    message: 'Mauvais mot de passe'
                })
            }
        }
    })

});
// Route pour gérer l'inscription (POST)
routeur.post("/inscription", function (req, res) {
    console.log(req.body);
    const { identifiant, prenom, nom, email, telephone, mot_de_passe, motDePasseConfirme } = req.body;

    con.query('SELECT email, identifiant FROM utilisateur WHERE email = ? OR identifiant = ?', [email, identifiant], (error, results) => {
        if (error) {
            console.log(error);
            throw error;
        }

        let emailExiste = false;
        let identifiantExiste = false;

        for (const utilisateur of results) {
            if (utilisateur.email === email) {
                emailExiste = true;
            }
            if (utilisateur.identifiant === identifiant) {
                identifiantExiste = true;
            }
        }

        if (emailExiste) {
            return res.render('pages/inscription', {
                message: 'Email déjà utilisé'
            });
        }

        if (identifiantExiste) {
            return res.render('pages/inscription', {
                message: 'Identifiant déjà utilisé'
            });
        }

        if (mot_de_passe !== motDePasseConfirme) {
            return res.render('pages/inscription', {
                message: 'Les mots de passe ne correspondent pas'
            });
        }
    })
    const motDePasseEncrypte = bcrypt.hashSync(mot_de_passe, 10);
    con.query('INSERT INTO utilisateur SET ?',
        {
            identifiant: identifiant,
            nom: nom,
            prenom: prenom,
            mot_de_passe: motDePasseEncrypte,
            email: email,
            telephone: telephone || null
        }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results, {
                    message: 'Utilisateur enregistre'
                });
                return res.redirect("/");
            }
        })
});
export default routeur;

