import { response, Router } from "express";
import express from "express";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';
import { ObjectId } from 'mongodb';
import cron from 'node-cron';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const empruntsCollection = mongocon.db("MangathequeBD").collection("emprunts");
const inventaireCollection = mongocon.db("MangathequeBD").collection("inventaire");
const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");

const penaliteJournaliere = -0.5;

async function appliquerPenalites() {
    console.log("pénalités démarré à", new Date().toISOString());
    const maintenant = new Date();
    const hier = new Date(maintenant);
    hier.setDate(maintenant.getDate() - 1);
    hier.setHours(23,59,59,999);

    const empruntsTard = await empruntsCollection.find({
        retournee : false,
        date_retour_prevue: { $lt: maintenant},
        $or: [
            {derniereDatePenalisee:{ $lt: hier} },
            {derniereDatePenalisee: null }
        ]
    }).toArray();

    for (const emprunt of empruntsTard){
        await utilisateurCollection.updateOne(
            { identifiant: emprunt.utilisateur_identifiant },
            { $inc: { solde : penaliteJournaliere } }
        );

        await empruntsCollection.updateOne(
            {_id : emprunt.id},
            { $set: { derniereDatePenalisee : maintenant} }
        );
    }
    console.log("pénalitées terminées à", new Date().toISOString());
}
cron.schedule('0 0 * * *', appliquerPenalites);

routeur.post('/test-penalites', async (req, res) => {
    await appliquerPenalites();
    res.send("Pénalités appliquées");
  });


// Ajouter un emprunt
routeur.post("/emprunt/:isbn", async (req, res) => {
    if (!req.session.user?.identifiant)
        return res.redirect("/connexion");

    const identifiant = req.session.user.identifiant;
    const isbnTome = parseFloat(req.params.isbn);

    let inventaire = await inventaireCollection.findOne({ isbn: isbnTome });
    let stock = inventaire.quantite;
    if (stock === 0) {
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
        isbn: isbnTome,
        date_emprunt: dateEmprunt,
        date_retour_prevue: dateRetourPrevue,
        retournee: false,
        derniereDatePenalisee: null
    };

    try {
        await empruntsCollection.insertOne(emprunt);
        let inventaire = await inventaireCollection.findOne({ isbn: emprunt.isbn });
        let stock = inventaire.quantite - 1;
        await inventaireCollection.updateOne({ isbn: emprunt.isbn }, { $set: { quantite: stock } });
        res.redirect("/emprunts");
    } catch (err) {
        console.error("Erreur création emprunt :", err);
        res.redirect("/tome/" + isbnTome);
    }
});

//liste d'emprunts
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
        const listeIsbn = emprunts.map(emprunt => emprunt.isbn);
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
                const emprunt = emprunts.find(e => e.isbn === objet.isbn);
                if (emprunt) {
                    objet._id = emprunt._id;
                    objet.dateEmprunt = emprunt.date_emprunt;
                    objet.dateRetourPrevue = emprunt.date_retour_prevue;
                    objet.retournee = emprunt.retournee;
                    objet.dateRetournee = emprunt.date_retournee;
                }
            });
            console.log("200, Résultats :", results);
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
            console.log("168 :" + emprunt);
            return res.render("pages/erreur", {
                message: "Emprunt introuvable",
                connecte: true
            });
        }
        const isbn = parseFloat(emprunt.isbn);
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
                console.error("190, Erreur récupération tomes pour emprunts :", error);
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
