import { response, Router } from "express";
import express from "express";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");

routeur.post("/coupCoeur/:isbn", async function (req, res) {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }

    const identifiant = req.session.user.identifiant;
    const isbnTome = parseFloat(req.params.isbn);

    try {
        const utilisateur = await utilisateurCollection.findOne({ identifiant });

        const estDejaFavori = utilisateur?.favorites?.includes(isbnTome);

        await utilisateurCollection.updateOne(
            { identifiant },
            estDejaFavori
                ? { $pull: { favorites: isbnTome } }
                : { $addToSet: { favorites: isbnTome } }
        );
        res.redirect(`/tomes/${isbnTome}`);
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

routeur.post("/coupCoeur/:isbn/supprimer", async (req, res) => {
    if (!req.session.user?.identifiant) {
        return res.redirect("/connexion");
    }

    const identifiant = req.session.user.identifiant;
    const isbnTome = parseFloat(req.params.isbn);

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

export default routeur;