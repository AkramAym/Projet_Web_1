import { response, Router } from "express";
import express from "express";
import con from '../mysqlbd.js';
import mongocon from '../mongodb.js';
import cron from 'node-cron';
import { envoyerMail } from '../mailer.js';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const empruntsCollection = mongocon.db("MangathequeBD").collection("emprunts");
const inventaireCollection = mongocon.db("MangathequeBD").collection("inventaire");
const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");
const notificationsCollection = mongocon.db("MangathequeBD").collection("notification");


const penaliteJournaliere = -0.5;

async function appliquerPenalites() {
    console.log("pénalités démarré à", new Date().toISOString());
    const maintenant = new Date();
    const hier = new Date(maintenant);
    hier.setDate(maintenant.getDate() - 1);
    hier.setHours(23, 59, 59, 999);

    const empruntsTard = await empruntsCollection.find({
        retournee: false,
        date_retour_prevue: { $lt: maintenant },
        $or: [
            { derniereDatePenalisee: { $lt: hier } },
            { derniereDatePenalisee: null }
        ]
    }).toArray();

    for (const emprunt of empruntsTard) {
        await utilisateurCollection.updateOne(
            { identifiant: emprunt.utilisateur_identifiant },
            { $inc: { solde: penaliteJournaliere } }
        );

        await empruntsCollection.updateOne(
            { _id: emprunt.id },
            { $set: { derniereDatePenalisee: maintenant } }
        );

        const utilisateur = await utilisateurCollection.findOne({ identifiant: emprunt.utilisateur_identifiant });

        const message = `Bonjour ${utilisateur.prenom || utilisateur.identifiant},\n\nVous avez un emprunt en retard. Une pénalité de ${Math.abs(penaliteJournaliere)}$ a été appliquée à votre compte.\n\nMerci de retourner le tome dès que possible.`;
        await envoyerMail(utilisateur.email, "Pénalité pour emprunt en retard", message);

        await notificationsCollection.insertOne({
            utilisateur_identifiant: utilisateur.identifiant,
            message,
            lu: false,
            date: new Date()
        });
    }
    console.log("pénalitées terminées à", new Date().toISOString());
}

//
cron.schedule('0 0 * * *', appliquerPenalites);

routeur.post('/test-penalites', async (req, res) => {
    await appliquerPenalites();
    res.send("Pénalités appliquées");
});

routeur.post('/restock/:isbn', async (req, res) => {
    const isbn = parseFloat(req.params.isbn);
    const quantite = parseInt(req.body.quantite, 10);

    const tomeAvant = await inventaireCollection.findOne({ isbn });

    if (!tomeAvant) {
        console.log("65 erreur, tome introuvable");
    }

    const etaitEnRupture = tomeAvant.quantite === 0;
    await inventaireCollection.updateOne(
        { isbn: isbn },
        { $inc: { quantite: quantite } }
    );

    if (!etaitEnRupture) {
        console.log("pas en rupture");
        return res.redirect(`/tome/${isbn}`);
    }

    const utilisateursFavoris = await utilisateurCollection.find({
        favorites: { $in: [isbn] }
    }).toArray();
    if (utilisateursFavoris.length === 0) {
        console.log("❌ Aucun utilisateur avec ce tome en favori.");
        return res.redirect(`/tome/${isbn}`);
    }
    console.log("95" + utilisateursFavoris);
    const tomeDetail = await new Promise((resolve, reject) => {
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

        con.query(query, [isbn], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });

    const message = `${tomeDetail.titre_serie}, Tome ${tomeDetail.numero_volume} est à nouveau en stock !`;

    for (const utilisateur of utilisateursFavoris) {
        await notificationsCollection.insertOne({
            utilisateur_identifiant: utilisateur.identifiant,
            message,
            lu: false,
            date: new Date()
        });

        await envoyerMail(utilisateur.email, "Tome en Stock", message);
    }
    res.redirect(`/tome/${isbn}`);
});
export default routeur;