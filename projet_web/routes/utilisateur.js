import { response, Router } from "express";
import express from "express";
import session from "express-session";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { ObjectId } from 'mongodb';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());
const stripe = new Stripe('sk_test_51R8orP8qQxkurE6iWJhRpfNwWjb6NaRILqlS8wJLB1mzMz6IrNVdx1emfSINurQLUGbkKfF18q48ThBoiUZDRXOP002NidRVO0');

const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");
const panierCollection = mongocon.db("MangathequeBD").collection("panier");
const commandesCollection = mongocon.db("MangathequeBD").collection("commande");
const avisCollection = mongocon.db("MangathequeBD").collection("avis");
const empruntsCollection = mongocon.db("MangathequeBD").collection("emprunts");
const inventaireCollection = mongocon.db("MangathequeBD").collection("inventaire");


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
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
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

        if (!req.session.adresseTemp && utilisateur.adresse) {
            req.session.adresseTemp = utilisateur.adresse;
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

routeur.post("/coupCoeur/:isbn", async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }

    const identifiant = req.session.user.identifiant;
    const isbnTome = req.params.isbn;

    try {
        const utilisateur = await utilisateurCollection.findOne({ identifiant });

        const estDejaFavori = utilisateur?.favorites?.includes(isbnTome);

        await utilisateurCollection.updateOne(
            { identifiant },
            estDejaFavori
                ? { $pull: { favorites: isbnTome } }
                : { $addToSet: { favorites: isbnTome } }
        );

        res.redirect("/coupCoeur");
    } catch (error) {
        console.error(error);
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
        console.log("350, Utilisateur trouvé : " + utilisateur);
        if (!utilisateur?.favorites?.length) {
            return res.render("pages/coups-de-coeurs", {
                message: 'Vous n\'avez aucun coup de cœur',
                tomes: [],
                connecte: true
            });
        } else {

            const listeIsbn = utilisateur.favorites;
            console.log("360, liste de favoris : " + listeIsbn);

            const query = `
       SELECT 
            t.isbn AS isbn,
            t.numero_volume AS numero_volume,
            t.image AS image,
            t.prix AS prix_unitaire,
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

routeur.post("/coupCoeur/:isbn/supprimer", async (req, res) => {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }

    const identifiant = req.session.user.identifiant;
    const isbnTome = req.params.isbn;

    try {
        await utilisateurCollection.updateOne(
            { identifiant: identifiant },
            { $pull: { favorites: isbnTome } }
        );

        return res.redirect("/coupCoeur");
    } catch (error) {
        console.error(error);
        res.render("pages/coups-de-coeurs", {
            tomes: [],
            message: "Erreur lors de la suppression du coup de cœur.",
            connecte: true
        });
    }
});

routeur.get('/tome/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    const query = `
        SELECT t.isbn, t.numero_volume, t.image, t.prix, t.annee_publication,
               s.titre_serie, s.auteur, s.editeur, s.synopsis, t.stock
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE t.isbn = ?
    `;

    con.query(query, [isbn], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }

        if (results.length === 0) {
            return res.status(404).send('Tome non trouvé');
        }

        const tome = results[0];
        tome.prix = tome.prix.toFixed(2);

        let isFavori = false;
        let avis = [];

        try {
            if (req.session.user?.identifiant) {
                const utilisateur = await utilisateurCollection.findOne({ identifiant: req.session.user.identifiant });
                isFavori = utilisateur?.favorites?.includes(isbn) || false;
            }

            avis = await avisCollection.find({ isbn }).sort({ date: -1 }).toArray();
        } catch (error) {
            console.error("Erreur chargement avis :", error);
        }

        res.render('pages/tome', {
            tome,
            connecte: !!req.session.user,
            isFavori,
            avis
        });
    });
});

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

routeur.post("/avis/:isbn", async (req, res) => {
    if (!req.session.user?.identifiant) return res.redirect("/connexion");

    const isbn = req.params.isbn;
    const { note, commentaire } = req.body;
    const utilisateur_identifiant = req.session.user.identifiant;

    if (!note || !commentaire) {
        return res.redirect("/tome/" + isbn);
    }
    const avis = {
        isbn: isbn,
        utilisateur_identifiant,
        note: parseInt(note),
        commentaire,
        date: new Date()
    };
    try {
        await avisCollection.insertOne(avis);
        res.redirect("/tome/" + isbn);
    } catch (err) {
        console.error("Erreur lors de l'insertion de l'avis :", err);
        res.redirect("/tome/" + isbn);
    }
});

// Ajouter un emprunt
routeur.post("/emprunt/:isbn", async (req, res) => {
    if (!req.session.user?.identifiant)
        return res.redirect("/connexion");

    const identifiant = req.session.user.identifiant;
    const isbn = parseFloat(req.params.isbn);

    let inventaire = await inventaireCollection.findOne({ isbn: isbnTome });
    let stock = inventaire.quantite;
    if (quantite > stock) {
        return res.render("pages/erreur", {
            message: `Impossible d'emprunter ce tome. Aucun tome disponible dans l'inventaire.`,
            articles: [],
            connecte: true
        });
    }
    const dateEmprunt = new Date();
    const dateRetourPrevue = new Date();

    //Pret de 14 jours
    dateRetourPrevue.setDate(dateEmprunt.getDate() + 14);

    const emprunt = {
        utilisateur_identifiant: identifiant,
        tome_isbn: isbn,
        date_emprunt: dateEmprunt,
        date_retour_prevue: dateRetourPrevue,
        retournee: false
    };

    try {
        await empruntsCollection.insertOne(emprunt);
            let inventaire = await inventaireCollection.findOne({ isbn: emprunt.isbn });
            let stock = inventaire.quantite-1;
            await inventaireCollection.updateOne({isbn : article.isbn}, {$set: {quantite : stock}});
        res.redirect("/emprunts");
    } catch (err) {
        console.error("Erreur création emprunt :", err);
        res.redirect("/tome/" + isbn);
    }
});

routeur.get("/emprunts", async (req, res) => {
    if (!req.session.user?.identifiant)
        return res.redirect("/connexion");

    const identifiant = req.session.user.identifiant;
    try {
        const emprunts = await empruntsCollection.find({ utilisateur_identifiant: identifiant }).toArray();

        if (emprunts.length === 0) {
            return res.render("pages/emprunts", {
                message: "Vous n'avez aucun emprunt",
                emprunts: [],
                connecte: true
            });
        }
        const listeIsbn = emprunts.map(emprunt => emprunt.tome_isbn);
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

        con.query(query, [listeIsbn], (error, results) => {
            if (error) {
                console.error("Erreur récupération tomes pour emprunts :", error);
                return res.render("pages/emprunts", {
                    message: "Erreur lors de la récupération des emprunts",
                    emprunts: [],
                    connecte: true
                });
            }
            results.forEach(objet => {
                const emprunt = emprunts.find(e => e.tome_isbn === objet.isbn);
                if (emprunt) {
                    objet._id = emprunt._id;
                    objet.dateEmprunt = emprunt.date_emprunt;
                    objet.dateRetourPrevue = emprunt.date_retour_prevue;
                    objet.retournee = emprunt.retournee;
                    objet.dateRetournee = emprunt.date_retournee;
                }
            });
            console.log("200 Résultats :", results);
            res.render("pages/emprunts", {
                emprunts: results,
                connecte: true
            });
        });

    } catch (err) {
        console.error("Erreur route GET /emprunts :", err);
        res.render("pages/emprunts", {
            message: "Erreur serveur, veuillez réessayer plus tard",
            emprunts: [],
            connecte: true
        });
    }
});

routeur.get("/emprunts/:id", async (req, res) => {
    if (!req.session.user?.identifiant)
        return res.redirect("/connexion");

    const identifiant = req.session.user.identifiant;
    const idEmprunt = req.params.id;
    try {
        const emprunt = await empruntsCollection.findOne({
            _id: new ObjectId(idEmprunt),
            utilisateur_identifiant: identifiant
        });

        if (!emprunt) {
            return res.render("pages/erreur", {
                message: "Emprunt introuvable",
                connecte: true
            });
        }
        const isbn = parseFloat(emprunt.tome_isbn);
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
                t.isbn = ?`;

        con.query(query, isbn, (error, results) => {
            if (error) {
                console.error("Erreur récupération tomes pour emprunts :", error);
                return res.render("pages/erreur", {
                    message: "Emprunt introuvable",
                    connecte: true
                });
            }

            const empruntDetail = results[0];
            empruntDetail.id = emprunt._id;
            empruntDetail.dateEmprunt = emprunt.date_emprunt;
            empruntDetail.dateRetourPrevue = emprunt.date_retour_prevue;
            empruntDetail.retournee = emprunt.retournee;
            empruntDetail.dateRetournee = emprunt.date_retournee;

            res.render("pages/emprunt-details", {
                emprunt: empruntDetail,
                connecte: true
            });
        });

    } catch (err) {
        console.error("Erreur route GET /emprunts/:id :", err);
        res.render("pages/erreur", {
            message: "Erreur serveur, veuillez réessayer plus tard",
            connecte: true
        });
    }
});

export default routeur;
