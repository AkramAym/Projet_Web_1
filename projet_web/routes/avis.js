import express from "express";
import mongocon from "../mongodb.js";

const avisRouteur = express.Router();
avisRouteur.use(express.urlencoded({ extended: false }));
avisRouteur.use(express.json());

const avisCollection = mongocon.db("MangathequeBD").collection("avis");

avisRouteur.post("/avis/:isbn", async (req, res) => {
    // 🔥 CORRIGÉ ICI : user et non utilisateur
    if (!req.session.user?.identifiant) return res.redirect("/connexion");

    const isbn = req.params.isbn;
    const { note, commentaire } = req.body;
    const utilisateur_identifiant = req.session.user.identifiant;

<<<<<<< Updated upstream
    if (!note || !commentaire) {
        return res.redirect("/tomes/" + isbn);
    }
=======
    if (!note || !commentaire) return res.redirect("/tome/" + isbn);

>>>>>>> Stashed changes
    const avis = {
        isbn,
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

export default avisRouteur;
