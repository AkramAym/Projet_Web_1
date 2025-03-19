import { response, Router } from "express";
import express from "express";
import session from "express-session";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';
import bcrypt from "bcryptjs";

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");
const panierCollection = mongocon.db("MangathequeBD").collection("panier");

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
                telephone: telephone || null
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
routeur.post("/connexion",async function (req, res) {
    const { identifiant, mot_de_passe } = req.body;
    try {
        const utilisateur = await utilisateurCollection.findOne({ identifiant: identifiant })

        if (!utilisateur) {
            throw new Error('Identifiant inexistant')
        }
        const motDePasseValide = bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        if (!motDePasseValide) {
            throw new Error('Mot de passe invalide');
        } else {
            req.session.user = {
                identifiant: identifiant
            };
            res.redirect('/profil');
            console.log(utilisateur);
        }
    } catch (error){
        console.log(error);
        return res.render('pages/connexion', {
            message: error.message || 'Erreur lors de la connexion'
        });
    }
    });

/*routeur.get('/status', (req, res) => {
    return req.session.user ? res.status(200).send(request.session.user) :
        res.status(401).send({ message: "Non authentifie" });
});*/


//Route pour afficher le profil de l'utilisateur
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
            utilisateur: results[0],
            connecte: true
        });
    })
});


//Route pour afficher le panier de l'utilisateur
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
            articles: results,
            connecte: true
        });
    })
});

routeur.post("/panier", function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
});

export default routeur;

