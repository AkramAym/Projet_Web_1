import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql";
import { body, validationResult } from "express-validator";
import dateFormat from "dateformat";
import cookieParser from "cookieparser";
import utilisateurRouteur from "./routes/utilisateur.js";
const app = express();
// Définition du dossier contenant les vues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.use(session({
    secret: "yahou",
    saveUninitialized: false, //ne sauvegarde pa la session si l'utilisateur n'a rien fait
    resave: false, //ne sauvegarde pas la session si elle n'a pas ete sauvegarde
    cookie: {
        maxAge: 60000* 60,
    }
}));

app.use(utilisateurRouteur);

// Route principale (Page d'accueil)
app.get('/', function (req, res) {
    console.log(req.session);
    console.log(req.sessionID);
    console.log("accueil")
    req.session.visited = true;
    const query = `
        SELECT t.isbn, t.numero_volume, t.prix, t.image, t.serie_id_serie, s.titre_serie 
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
    `;

    var utilisateurConnecte = false;
        if (req.session.user?.identifiant){
            utilisateurConnecte = true;
        }

    con.query(query, function (err, result) {
        if (err) throw err;
        res.render("pages/index", {
            tomes: result,
            connecte: utilisateurConnecte
        });
    });
});

// Route pour afficher la page "Nos séries"
app.get('/nos-series', function (req, res) {
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

app.get('/series/:id', async function (req, res) {
    const serieID = req.params.id; 
    console.log(req.session);
    console.log(req.sessionID);
    const query = `
        SELECT t.isbn, t.numero_volume, t.prix, t.image, t.serie_id_serie, s.titre_serie 
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
        res.render("pages/serieTomes", {
            tomes: result,
            connecte: utilisateurConnecte
        });
    });
});

app.get('/tomes/:isbn', function (req, res) {
    const tomeISBN = req.params.isbn; 
    console.log(req.session);
    console.log(req.sessionID);
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
    con.query(query, [tomeISBN], (err, result) =>{
        if (err) throw err;
        res.render("pages/tome", {
            tome: result[0],
            connecte: utilisateurConnecte
        });
    });
});


// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});