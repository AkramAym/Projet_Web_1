import { response, Router } from "express";
import express from "express";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';
const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const panierCollection = mongocon.db("MangathequeBD").collection("panier");
const inventaireCollection = mongocon.db("MangathequeBD").collection("inventaire");

//Route pour afficher le panier de l'utilisateur
routeur.get('/panier', async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }
    const identifiant = req.session.user.identifiant;

    try {
        const panier = await panierCollection.findOne({ utilisateur_identifiant: identifiant });

        if (!panier) {
            return res.render("pages/panier", {
                message: 'Votre panier est vide',
                articles: [],
                connecte: true
            });
        } else {
            const listeIsbn = panier.articles.map(article => article.tome_isbn);
            if (listeIsbn.length === 0) {
                return res.render("pages/panier", {
                    message: 'Votre panier est vide',
                    articles: [],
                    connecte: true
                });
            }
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
                console.log("191 Résultats de la requête:", results);
                // Calcul du sous-total pour chaque article
                results.forEach(objet => {
                    const articlePanier = panier.articles.find(article => article.tome_isbn === objet.isbn);
                    if (articlePanier) {
                        objet.prix_unitaire = objet.prix_unitaire.toFixed(2);
                        objet.quantite = articlePanier.quantite || 1;
                        objet.sous_total = (objet.prix_unitaire * articlePanier.quantite).toFixed(2); // Calcul du sous-total avec deux décimales
                    }
                });
                console.log("200 Résultats de l'attachament quantité+sous-total:", results);
                // Calcul du total du panier
                let prixTotal = 0;
                results.forEach(article => {
                    prixTotal += parseFloat(article.sous_total); // Additionner tous les sous-totaux
                });
                req.session.panierData = {
                    articles: results,
                    prixTotal: prixTotal.toFixed(2)
                };

                res.render("pages/panier", {
                    articles: results,
                    prixTotal: prixTotal.toFixed(2),  // Total avec deux décimales
                    connecte: true
                });
            });
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
    const isbnTome = parseFloat(req.params.isbn);
    console.log(req.body, req.params.isbn);
    let inventaire = await inventaireCollection.findOne({ isbn: isbnTome });
    let stock = inventaire.quantite;

    if (quantite > stock) {
        return res.render("pages/erreur", {
            message: `Impossible d’ajouter ${quantite} exemplaire(s). stock disponible : ${inventaire.quantite}.`,
            articles: [],
            connecte: true
        });
    }
    try {
        let panier = await panierCollection.findOne({ utilisateur_identifiant: identifiant });
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
            res.redirect('/panier');
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
    const isbnTome = parseFloat(req.params.isbn);
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

//Route pour modifier la quantité d'article depuis la page panier
routeur.post("/panier/:isbn/modifier", async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }

    const identifiant = req.session.user.identifiant;
    const isbnTome = parseFloat(req.params.isbn);
    const nouvelleQuantite = parseInt(req.body.quantite, 10);

    try {
        const panier = await panierCollection.findOne({ utilisateur_identifiant: identifiant });

        if (!panier) {
            return res.redirect("/panier");
        }

        const article = panier.articles.find(a => a.tome_isbn === isbnTome);
        if (article) {
            article.quantite = nouvelleQuantite;

            await panierCollection.updateOne(
                { _id: panier._id },
                { $set: { articles: panier.articles } }
            );
        }

        return res.redirect("/panier");
    } catch (error) {
        console.log(error);
        res.render("pages/panier", {
            message: "Erreur lors de la modification de la quantité",
            connecte: true
        });
    }
});

export default routeur;