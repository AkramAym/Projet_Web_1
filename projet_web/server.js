import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql";
import { body, validationResult } from "express-validator";
import dateFormat from "dateformat";

const app = express();

// Définition du dossier contenant les vues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

const con = mysql.createConnection({
    host: "localhost",
    user: "scott",
    password: "oracle",
    database: "mybd"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("connected!");
});

// Route principale (Page d'accueil)
app.get('/', function (req, res) {
    const query = `
        SELECT t.numero_volume, t.prix, t.image, t.serie_id_serie, s.titre_serie 
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE t.isbn = 9791032705544
    `;

    con.query(query, function (err, result) {
        if (err) throw err;

        // Passer les données au template
        res.render("pages/index", {
            tome: result[0] // On suppose que la requête retourne un seul résultat
        });
    });
});

// Route pour afficher la page d'inscription
app.get('/inscription', (req, res) => {
    res.render('pages/inscription');
});

// Route pour afficher la page de connexion
app.get('/connexion', (req, res) => {
    res.render('pages/connexion');
});

// Route pour afficher la page "Nos séries"
app.get('/nos-series', (req, res) => {
    res.render('pages/nos-series'); // Assurez-vous que le fichier `nos-series.ejs` existe dans le dossier `views/pages`
});

// Route pour gérer l'inscription (POST)
app.post("/inscription/add", function (req, res) {
    const parametres = [
        req.body.identifiant,
        req.body.prenom,
        req.body.nom,
        req.body.email,
        req.body.telephone,
        req.body.password
    ];
    // Ajoutez ici la logique pour traiter l'inscription
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});