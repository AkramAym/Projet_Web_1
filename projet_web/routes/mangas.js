import { response, Router } from "express";
import express from "express";
import con from '../mysqlbd.js';

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());
import mongocon from '../mongodb.js';
const avisCollection = mongocon.db("MangathequeBD").collection("avis");

const utilisateurCollection = mongocon.db("MangathequeBD").collection("utilisateur");
const inventaireCollection = mongocon.db("MangathequeBD").collection("inventaire");
// Route pour afficher la page "Nos séries"
routeur.get('/nos-series', function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    const query = `
        SELECT id_serie, titre_serie, image_serie, aguicheur
        FROM serie
    `;

    con.query(query, function (err, result) {
        if (err) throw err;

        var utilisateurConnecte = false;
        if (req.session.user?.identifiant){
            utilisateurConnecte = true;
        }
        res.render("pages/nos-series", {
            series: result,
            connecte: utilisateurConnecte
        });
    });
});

//Route pour afficher les tomes d'une serie
routeur.get('/series/:id', function (req, res) {
    const serieID = req.params.id; 
    console.log(req.session);
    console.log(req.sessionID);
    const query = `
        SELECT t.isbn, t.numero_volume, t.prix, t.image, s.titre_serie, s.imageLong_serie
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE t.serie_id_serie = ?
        ORDER BY t.numero_volume ASC
    `;
    var utilisateurConnecte = false;
        if (req.session.user?.identifiant){
            utilisateurConnecte = true;
        }


    con.query(query, [serieID], (err, result) =>{
        if (err) throw err;
        const serieInfo = {
            titre_serie: result[0].titre_serie,
            imageLong_serie: result[0].imageLong_serie
        };
        result.forEach(objet => {
            objet.prix = objet.prix.toFixed(2);
        });

        console.log(result[0].titre_serie);
        res.render("pages/serieTomes", {
            tomes: result,
            serie: serieInfo,
            connecte: utilisateurConnecte
        });
    });
});

//Route pour afficher les series d'une categorie
routeur.get('/categories/:id', function (req, res) {
    const categorieID = req.params.id; 
    if (categorieID < 1 || categorieID > 3){
        return res.redirect("/pageErreur");
    }
    console.log(req.session);
    console.log(req.sessionID);
    const query = `
    SELECT s.id_serie, s.titre_serie, s.image_serie, s.aguicheur, c.nom_categorie
    FROM serie s
    JOIN categorie c ON s.categorie_id_categorie = c.id_categorie
    WHERE c.id_categorie = ?
`;
    var utilisateurConnecte = false;
        if (req.session.user?.identifiant){
            utilisateurConnecte = true;
        }
    con.query(query, [categorieID], (err, result) =>{
        if (err) throw err;
        res.render("pages/categorie", {
            series: result,
            nomCategorie : result[0].nom_categorie,
            connecte: utilisateurConnecte
        });
    });
});

//Route pour afficher la page d'un tome
routeur.get('/tomes/:isbn', async function (req, res) {
    const tomeISBN = req.params.isbn; 
    const query = `
        SELECT t.isbn, 
        t.numero_volume, 
        t.prix, 
        t.image,
        t.serie_id_serie, 
        t.annee_publication,
        s.titre_serie, 
        s.auteur,
        s.synopsis,
        s.editeur,
        s.categorie_id_categorie
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE t.isbn = ?
    `;

    var utilisateurConnecte = false;
    if (req.session.user?.identifiant){
        utilisateurConnecte = true;
    }

    con.query(query, [tomeISBN], async (err, result) => {
        if (err) throw err;
    
        const tome = result[0];
        tome.prix = tome.prix.toFixed(2);

        let inventaire = await inventaireCollection.findOne({ isbn: tomeISBN});
        if (!inventaire) {
            inventaire = { isbn: parseFloat(tomeISBN), quantite: 10 };
            await inventaireCollection.insertOne(inventaire);
          }
          tome.stock = inventaire.quantite;

        let isFavori = false;
        let avis = [];

        try {
            if (req.session.user?.identifiant) {
                const utilisateur = await utilisateurCollection.findOne({ identifiant: req.session.user.identifiant });
                isFavori = utilisateur?.favorites?.includes(tomeISBN);
            }

            avis = await avisCollection.find({ isbn: tomeISBN }).sort({ date: -1 }).toArray();
        } catch (e) {
            console.error("Erreur récupération avis :", e);
        }
    
        res.render("pages/tome", {
            tome,
            isFavori,
            connecte: utilisateurConnecte,
            avis
        });
    });
});


export default routeur;