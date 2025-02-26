import { response, Router } from "express";
import express from "express";
import session from "express-session";
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
                req.session.user = {
                    identifiant: identifiant
                };
                return res.redirect("/");
            }
        })
});

// Route pour afficher la page de connexion
routeur.get('/connexion', (req, res) => {
    res.render('pages/connexion', {
        message: null
    });
});

routeur.post("/connexion", function (req, res) {
    const { identifiant, mot_de_passe } = req.body;

    con.query('SELECT * FROM utilisateur WHERE identifiant = ?', [identifiant], (error, results) => {
        if (error) {
            console.log(error);
            throw error;
        }

        if (results.length <= 0) {
            return res.render('pages/connexion', {
                message: 'Identifiant inexistant'
            })
        } else {
            const utilisateur = results[0];
            const motDePasseValide = bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
            if (!motDePasseValide) {
                return res.render('pages/connexion', {
                    message: 'Mauvais mot de passe'
                })
            } else {
                req.session.user = {
                    identifiant: identifiant
                };
                res.redirect('/profil');
                console.log(utilisateur);
            }
        }
    })
});

routeur.get('/status', (req, res) => {
    return req.session.user ? res.status(200).send(request.session.user) :
        res.status(401).send({ message: "Non authentifie" });
});


routeur.get('/profil', function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    console.log("profil");
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;
    con.query('SELECT * FROM utilisateur WHERE identifiant = ?', [identifiant], (error, results) => {
        if (error) {
            console.log(error);
            throw error;
        }

        res.render("pages/profil", {
            utilisateur: results[0]
        });
    })
});

routeur.get('/panier', function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    console.log("profil");
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;

    const query = `
       SELECT 
            t.isbn AS isbn,
            t.numero_volume AS numero_volume,
            t.image AS image,
            s.titre_serie AS titre_serie,
            t.prix AS prix_unitaire,
            ap.quantite AS quantite,
            (t.prix * ap.quantite) AS sous_total
        FROM 
            utilisateur u
        JOIN 
            panier p ON u.identifiant = p.utilisateur_identifiant
        JOIN 
            article_panier ap ON p.id_panier = ap.panier_id_panier
        JOIN 
            tome t ON ap.tome_isbn = t.isbn
        JOIN 
            serie s ON t.serie_id_serie = s.id_serie
        WHERE 
            u.identifiant = ? 
            AND p.id_panier = (
                SELECT id_panier 
                FROM panier 
                WHERE utilisateur_identifiant = u.identifiant
                ORDER BY date_creation DESC 
                LIMIT 1)
        `;

    con.query(query, [identifiant], (error, results) => {
        if (error) {
            console.log(error);
            throw error;
        }

        res.render("pages/panier", {
            articles: results
        });
    })
});

export default routeur;

