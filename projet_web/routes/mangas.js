import { response, Router } from "express";
import express from "express";
import mysql from "mysql";

const routeur = Router();
routeur.use(express.urlencoded({ extended: false }));
routeur.use(express.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "scott",
    password: "oracle",
    database: "MangathequeBD",
    charset: 'utf8mb4'
});
con.connect(function (err) {
    if (err) throw err;
    console.log("connected!");
});


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
    SELECT id_serie, titre_serie, image_serie, aguicheur
    FROM serie
    WHERE categorie_id_categorie = ?
`;
    var utilisateurConnecte = false;
        if (req.session.user?.identifiant){
            utilisateurConnecte = true;
        }
    con.query(query, [categorieID], (err, result) =>{
        if (err) throw err;
        res.render("pages/categorie", {
            series: result,
            connecte: utilisateurConnecte
        });
    });
});

//Route pour afficher la page d'un tome
routeur.get('/tomes/:isbn', function (req, res) {
    const tomeISBN = req.params.isbn; 
    console.log(req.session);
    console.log(req.sessionID);
    const query = `
        SELECT t.isbn, 
        t.numero_volume, 
        t.prix, 
        t.image,
        t.stock, 
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
    con.query(query, [tomeISBN], (err, result) =>{
        if (err) throw err;
        res.render("pages/tome", {
            tome: result[0],
            connecte: utilisateurConnecte
        });
    });
});

export default routeur;