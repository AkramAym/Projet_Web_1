import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";
import dateFormat from "dateformat";
import cookieParser from "cookieparser";
import utilisateurRouteur from "./routes/utilisateur.js";
import mangasRouteur from "./routes/mangas.js";
import con from './mysqlbd.js';
import mongocon from './mongodb.js';
import MongoStore from "connect-mongo";

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

app.use(session({
    secret: "yahou",
    saveUninitialized: false, //ne sauvegarde pa la session si l'utilisateur n'a rien fait
    resave: false, //ne sauvegarde pas la session si elle n'a pas ete sauvegarde
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({
        client: mongocon
    })
}));

app.use(utilisateurRouteur);
app.use(mangasRouteur);

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
        WHERE t.numero_volume = 1
    `;

    var utilisateurConnecte = false;
    if (req.session.user?.identifiant) {
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

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

// Route pour ajouter un coup de cœur
app.post('/ajouter-coup-de-coeur/:isbn', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Connectez-vous pour ajouter aux coups de cœur');
    }

    const { isbn } = req.params;
    const userId = req.session.user.identifiant;

    const query = 'INSERT INTO coup_de_coeur (utilisateur_identifiant, tome_isbn, date_ajout) VALUES (?, ?, CURDATE())';
    
    con.query(query, [userId, isbn], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur lors de l\'ajout aux coups de cœur');
        }
        res.redirect('back');
    });
});

// Route pour afficher la page des coups de cœur
app.get('/coups-de-coeur', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/connexion');
    }

    const userId = req.session.user.identifiant;
    
    const query = `
        SELECT t.*, s.titre_serie 
        FROM coup_de_coeur c
        JOIN tome t ON c.tome_isbn = t.isbn
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE c.utilisateur_identifiant = ?
    `;
    
    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la récupération des coups de cœur.");
        }
        res.render('pages/coups-de-coeur', { 
            tomes: result,
            connecte: true
        });
    });
});
console.log(path.join(__dirname, 'views'));
console.log('Vérification de la vue coups-de-coeur.ejs');
