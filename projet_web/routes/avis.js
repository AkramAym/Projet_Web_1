import { response, Router } from "express";
import express from "express";
import mongocon from '../mongodb.js';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const avisCollection = mongocon.db("MangathequeBD").collection("avis");

routeur.post("/avis/:isbn", async (req, res) => {
    if (!req.session.user?.identifiant) return res.redirect("/connexion");

    const isbn = req.params.isbn;
    const { note, commentaire } = req.body;
    const utilisateur_identifiant = req.session.user.identifiant;

    if (!note || !commentaire) {
        return res.redirect("/tomes/" + isbn);
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
        res.redirect("/tomes/" + isbn);
    } catch (err) {
        console.error("Erreur lors de l'insertion de l'avis :", err);
        res.redirect("/tomes/" + isbn);
    }
});

export default routeur;