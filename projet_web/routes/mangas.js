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
const empruntsCollection = mongocon.db("MangathequeBD").collection("emprunts");
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
    const tomeISBN = parseFloat(req.params.isbn); 
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
    const identifiant = req.session.user.identifiant;
    var utilisateurConnecte = false;
    if (req.session.user?.identifiant){
        utilisateurConnecte = true;
    }

    con.query(query, [tomeISBN], async (err, result) => {
        if (err) throw err;
    
        const tome = result[0];
        tome.prix = tome.prix.toFixed(2);

        //Récupère le stock restant du tome
        let inventaire = await inventaireCollection.findOne({ isbn: tomeISBN});
        if (!inventaire) {
            inventaire = { isbn: parseFloat(tomeISBN), quantite: 10 };
            await inventaireCollection.insertOne(inventaire);
          }
          tome.stock = inventaire.quantite;

        //Regarde si l'utilisateur a déjà emprunté ce tome
        const dejaEmprunte = await empruntsCollection.findOne({ 
            utilisateur_identifiant : identifiant,
            isbn : tomeISBN,
            retournee : false
         })

        let isFavori = false;
        let avis = [];

        try {
            if (req.session.user?.identifiant) {
                const utilisateur = await utilisateurCollection.findOne({ identifiant: identifiant });
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
            avis,
            dejaEmprunte
        });
    });
});

routeur.get('/nos-mangas', async (req, res) => {
    const { sort = 'default', editeurs = [], auteurs = [], series = [] } = req.query;

    let filters = '';
    const params = [];

    if (editeurs.length) {
        filters += ' AND s.editeur IN (?)';
        params.push(editeurs);
    }
    if (auteurs.length) {
        filters += ' AND s.auteur IN (?)';
        params.push(auteurs);
    }
    if (series.length) {
        filters += ' AND s.titre_serie IN (?)';
        params.push(series);
    }

    let orderBy = 's.titre_serie ASC, t.numero_volume ASC';
    if (sort === 'prix_asc') orderBy = 't.prix ASC';
    if (sort === 'prix_desc') orderBy = 't.prix DESC';

    const sql = `
        SELECT 
            t.isbn, t.numero_volume, t.image, t.prix,
            s.titre_serie, s.auteur, s.editeur
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE 1 = 1 ${filters}
        ORDER BY ${orderBy}
    `;

    const editeurSQL = 'SELECT DISTINCT editeur FROM serie ORDER BY editeur ASC';
    const auteurSQL = 'SELECT DISTINCT auteur FROM serie ORDER BY auteur ASC';
    const serieSQL = 'SELECT DISTINCT titre_serie FROM serie ORDER BY titre_serie ASC';

    try {
        con.query(sql, params, async (err, mangas) => {
            if (err) throw err;

            // Stock MongoDB
            for (let m of mangas) {
                const inv = await mongocon.db("MangathequeBD").collection("inventaire").findOne({ isbn: m.isbn });
                m.stock = inv ? inv.quantite : 0;
            }

            // Tri par stock (popularité)
            if (sort === 'stock') {
                mangas.sort((a, b) => a.stock - b.stock);
            }

            con.query(editeurSQL, (err, editeurs) => {
                con.query(auteurSQL, (err, auteurs) => {
                    con.query(serieSQL, (err, series) => {
                        res.render('pages/nos-mangas', {
                            mangas,
                            editeurs,
                            auteurs,
                            series,
                            connecte: !!req.session?.user
                        });
                    });
                });
            });
        });
    } catch (e) {
        console.error("Erreur /nos-mangas :", e);
        res.status(500).send('Erreur serveur');
    }
});



export default routeur;