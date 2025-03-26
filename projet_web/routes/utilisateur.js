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
routeur.post("/connexion", async function (req, res) {
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
    } catch (error) {
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

        res.render("pages/profil", {
            utilisateur: utilisateur,
            connecte: true
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/connexion");
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


//Route pour afficher le panier de l'utilisateur
routeur.get('/panier', async function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    console.log("panier");
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;

    try {
        const panier = await panierCollection.findOne({ utilisateur_identifiant: identifiant });
        if (!panier) {
            return res.render("pages/panier", {
                message: 'Votre panier est vide',
                connecte: true
            });
        } else {

            const listeIsbn = panier.articles.map(article => article.tome_isbn);

            const query = `
       SELECT 
            t.isbn AS isbn,
            t.numero_volume AS numero_volume,
            t.image AS image,
            s.titre_serie AS titre_serie,
            t.prix AS prix_unitaire
        FROM 
            tome t
       JOIN 
                serie s ON t.serie_id_serie = s.id_serie
            WHERE 
                t.isbn IN (?)`;

            con.query(query, [listeIsbn], (error, results) => {
                if (error) {
                    console.log(error);
                    throw error;
                }

                for (let objet of results) {
                    const articlePanier = panier.articles.find(article => article.tome_isbn === objet.isbn);
                    if (articlePanier) {
                        objet.quantite = articlePanier.quantite;
                        objet.sous_total = objet.prix_unitaire * objet.quantite;
                    }
                }

                res.render("pages/panier", {
                    articles: results,
                    connecte: true
                });
            })
        }
    } catch (error) {
        console.log(error);
        res.render("pages/panier", {
            message: 'Erreur lors de la récupération du panier',
            connecte: true
        });
    }
});

//Ajout d'un tome dans un panier
routeur.post("/panier/:isbn", async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;
    const quantite = parseInt(req.body.quantite, 10);
    const isbnTome = req.params.isbn;
    console.log (req.body, req.params.isbn);
    try {
        let panier = await panierCollection.findOne({
            utilisateur_identifiant: identifiant
        });

        if (!panier) {
            panier = {
                utilisateur_identifiant: identifiant,
                date_creation: new Date(),
                articles: [
                    {
                        tome_isbn: isbnTome,
                        quantite: quantite
                    }
                ]
            };
            await panierCollection.insertOne(panier);
        } else {

            const existingArticle = panier.articles.find(article => article.tome_isbn === isbnTome);

            if (existingArticle) {

                existingArticle.quantite += quantite;
            } else {

                panier.articles.push({
                    tome_isbn: isbnTome,
                    quantite: quantite
                });
            }
            await panierCollection.updateOne(
                { _id: panier._id },
                { $set: { articles: panier.articles } }
            );
            res.redirect('/panier');
        }
    } catch (error) {
        console.log(error);
        res.render("pages/panier", {
            message: 'Erreur lors de la récupération du panier',
            connecte: true
        });
    }
});

//Suppression d'un tome dans un panier
routeur.post("/panier/:isbn/supprimer", async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;
    const isbnTome = req.params.isbn;
    try {
        const panier = await panierCollection.findOne({ utilisateur_identifiant: identifiant });

        if (panier) {
            // Filtrer les articles pour supprimer celui qui a cet ISBN
            const nouveauxArticles = panier.articles.filter(article => article.tome_isbn !== isbnTome);

            // Mettre à jour le panier dans la collection
            await panierCollection.updateOne(
                { _id: panier._id },
                { $set: { articles: nouveauxArticles } }
            );
        }

        res.redirect("/panier");  // Redirige l'utilisateur vers la page du panier
    } catch (error) {
        console.log(error);
        res.render("pages/panier", {
            message: 'Erreur lors de la suppression du tome du panier',
            connecte: true
        });
    }
});

routeur.post("/coupCoeur/:isbn", async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;
    const isbnTome = req.params.isbn;

    try {
        // Vérifier si le tome est déjà dans les favoris
        const favoriExiste = await utilisateurCollection.findOne({ 
            identifiant: identifiant,
            favorites: isbnTome 
        });
        if (favoriExiste) {
            // Retirer le favori
            await utilisateurCollection.updateOne(
                { identifiant: identifiant },
                { $pull: { favorites: isbnTome } }
            );
        } else {
            // Ajouter le favori
            await utilisateurCollection.updateOne(
                { identifiant: identifiant },
                { $addToSet: { favorites: isbnTome } }
            );
        }

        res.redirect('/coupCoeur'); // Redirige vers la page précédente

    } catch (error) {
        console.log(error);
        res.render("pages/erreur", {
            message: 'Erreur lors de la mise à jour des favoris',
            connecte: true
        });
    }
});

routeur.get('/coupCoeur', async function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    console.log("coupCoeur");
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;
    try {
        const utilisateur = await utilisateurCollection.findOne({ identifiant: identifiant });
        console.log (utilisateur);
        if (!utilisateur?.favorites?.length) {
            return res.render("pages/coups-de-coeurs", {
                message: 'Vous n\'avez aucun coup de cœur',
                tomes: [],
                connecte: true
            });
        } else {

            const listeIsbn = utilisateur.favorites;
            console.log("360" + listeIsbn);

            const query = `
       SELECT 
            t.isbn AS isbn,
            t.numero_volume AS numero_volume,
            t.image AS image,
            s.titre_serie AS titre_serie
        FROM 
            tome t
       JOIN 
                serie s ON t.serie_id_serie = s.id_serie
            WHERE 
                t.isbn IN (?)`;

                if (!listeIsbn.length) {
                    return res.render("pages/coups-de-coeurs", {
                        message: 'Vous n\'avez aucun coup de cœur',
                        tomes: [], 
                        connecte: true
                    });
                }
            con.query(query, [listeIsbn], (error, results) => {
                if (error) {
                    console.log(error);
                    throw error;
                }
                res.render("pages/coups-de-coeurs", {
                    tomes: results,
                    connecte: true
                });
            })
        }
    } catch (error) {
        console.log(error);
        res.render("pages/coups-de-coeurs", {
            message: 'Erreur lors de la récupération du panier',
            connecte: true
        });
    }
});
export default routeur;

