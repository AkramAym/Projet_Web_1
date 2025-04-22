import { response, Router } from "express";
import express from "express";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';
import Stripe from "stripe";
import { ObjectId } from 'mongodb';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());
const stripe = new Stripe('sk_test_51R8orP8qQxkurE6iWJhRpfNwWjb6NaRILqlS8wJLB1mzMz6IrNVdx1emfSINurQLUGbkKfF18q48ThBoiUZDRXOP002NidRVO0');

const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");
const panierCollection = mongocon.db("MangathequeBD").collection("panier");
const commandesCollection = mongocon.db("MangathequeBD").collection("commande");
const inventaireCollection = mongocon.db("MangathequeBD").collection("inventaire");

routeur.get('/livraison', async function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    if (!req.session.user?.identifiant) {
        return res.redirect('/connexion');
    }

    if (req.session.adresseTemp) {
        return res.redirect('/paiement');
    }

    const identifiant = req.session.user.identifiant;

    if (req.session.panierData) {
        const { articles, prixTotal } = req.session.panierData;
        return res.render('pages/livraison', {
            articles,
            prixTotal,
            connecte: true
        });
    }

    try {
        const panier = await panierCollection.findOne({ utilisateur_identifiant: identifiant });
        if (!panier || panier.articles.length === 0) {
            return res.redirect('/panier');
        }

        const listeIsbn = panier.articles.map(article => article.tome_isbn);
        const query = `
            SELECT t.isbn, t.numero_volume, t.image, s.titre_serie, t.prix
            FROM tome t
            JOIN serie s ON t.serie_id_serie = s.id_serie
            WHERE t.isbn IN (?)`;

        con.query(query, [listeIsbn], (error, results) => {
            if (error) throw error;

            results.forEach(obj => {
                const item = panier.articles.find(a => a.tome_isbn === obj.isbn);
                obj.quantite = item.quantite || 1;
                obj.prix = obj.prix.toFixed(2);
                obj.sous_total = (obj.quantite * parseFloat(obj.prix)).toFixed(2);
            });

            const prixTotal = results.reduce((acc, a) => acc + parseFloat(a.sous_total), 0);

            req.session.panierData = {
                articles: results,
                prixTotal: prixTotal.toFixed(2)
            };
            res.redirect('/livraison');
        });
    } catch (err) {
        console.error(err);
        res.redirect('/panier');
    }
});

//Route qui ajoute l'adresse de l'utilisateur dans la base de donnée et dans les informations de session
routeur.post('/livraison', async function (req, res) {
    if (!req.session.user?.identifiant) return res.redirect('/connexion');
    const identifiant = req.session.user.identifiant;

    const { prenom, nom, adresse, ville, code_postal, telephone } = req.body;
    const adresseObj = { prenom, nom, adresse, ville, code_postal, telephone };

    try {
        await utilisateurCollection.updateOne(
            { identifiant: identifiant },
            { $set: { adresse: adresseObj } }
        );

        req.session.adresseTemp = adresseObj;
        return res.redirect('/paiement');
    } catch (err) {
        console.error(err);
        res.redirect('/livraison');
    }
});

routeur.get('/paiement', async (req, res) => {
    if (!req.session.user?.identifiant) return res.redirect('/connexion');

    const identifiant = req.session.user.identifiant;
    const { articles, prixTotal } = req.session.panierData;
    const adresse = req.session.adresseTemp;

    req.session.paiementData = {
        identifiant,
        adresse,
        articles,
        prixTotal
    };
    console.log(req.session.paiementData);

    if (!articles || !prixTotal) {
        return res.redirect('/panier');
    }

    try {
        const line_items = articles.map(article => ({
            price_data: {
                currency: 'cad',
                product_data: {
                    name: `${article.titre_serie} - Tome ${article.numero_volume}`
                },
                unit_amount: Math.round(parseFloat(article.prix_unitaire) * 100),
            },
            quantity: article.quantite,
        }));

        const sessionStripe = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `http://localhost:3000/confirmation`,
            cancel_url: `http://localhost:3000/panier`
        });

        return res.redirect(303, sessionStripe.url);
    } catch (err) {
        console.error('Stripe Session Error:', err);
        return res.redirect('/panier');
    }
});

routeur.get('/confirmation', async (req, res) => {
    if (!req.session.user?.identifiant) return res.redirect('/connexion');

    const { identifiant, adresse, articles, prixTotal } = req.session.paiementData;

    if (!articles || !prixTotal) {
        return res.redirect('/panier');
    }

    try {
        const nouvelleCommande = {
            utilisateur_identifiant: identifiant,
            adresse: adresse,
            date_commande: new Date(),
            articles: articles,
            total: prixTotal
        };

        await commandesCollection.insertOne(nouvelleCommande);
        for (const article of articles) {
            let inventaire = await inventaireCollection.findOne({ isbn: article.isbn });
            let stock = inventaire.quantite;
            stock -= article.quantite;
            await inventaireCollection.updateOne({isbn : article.isbn}, {$set: {quantite : stock}});
        }
        await panierCollection.deleteOne({ utilisateur_identifiant: identifiant });

        delete req.session.paiementData;


        res.render('pages/confirmation', {
            message: "Paiement réussi ! Votre commande a été enregistrée.",
            commande: nouvelleCommande,
            connecte: true
        });

    } catch (error) {
        console.error(error);
        res.render("pages/confirmation", {
            message: "Une erreur s'est produite.",
            commande: null,
            connecte: true
        });
    }
});

routeur.get('/commandes', async (req, res) => {
    if (!req.session.user?.identifiant) return res.redirect('/connexion');

    const identifiant = req.session.user.identifiant;

    try {
        const commandes = await commandesCollection
            .find({ utilisateur_identifiant: identifiant })
            .sort({ date_commande: -1 })
            .toArray();

        res.render('pages/commandes', {
            commandes,
            connecte: true
        });
    } catch (error) {
        console.error("Erreur récupération commandes :", error);
        res.render('pages/commandes', {
            commandes: [],
            message: 'Erreur lors de la récupération des commandes.',
            connecte: true
        });
    }
});

routeur.get('/commandes/:id', async (req, res) => {
    if (!req.session.user?.identifiant) return res.redirect('/connexion');

    const idCommande = req.params.id;
    const identifiant = req.session.user.identifiant;

    try {
        const commande = await commandesCollection.findOne({
            _id: new ObjectId(idCommande),
            utilisateur_identifiant: identifiant
        });

        if (!commande) {
            return res.status(404).render('pages/erreur', {
                message: "Commande introuvable",
                connecte: true
            });
        }

        res.render('pages/commande-details', {
            commande,
            connecte: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('pages/erreur', {
            message: "Erreur lors de l'affichage de la commande",
            connecte: true
        });
    }
});

export default routeur;