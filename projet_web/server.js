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
    database: "MangathequeBD"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("connected!");
});

// Route principale (Page d'accueil)
app.get('/', function (req, res) {
    const query = `
        SELECT t.isbn, t.numero_volume, t.prix, t.image, t.serie_id_serie, s.titre_serie 
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
    `;

    con.query(query, function (err, result) {
        if (err) throw err;

        res.render("pages/index", {
            tomes: result 
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
app.get('/nos-series', function (req, res) {
    const query = `
        SELECT titre_serie, image_serie, aguicheur
        FROM serie
    `;

    con.query(query, function (err, result) {
        if (err) throw err;

        res.render("pages/nos-series", {
            series: result
        });
    });
});

// Route pour gérer l'inscription (POST)
app.post("/inscription", function (req, res) {
    const parametres = [
        req.body.identifiant,
        req.body.prenom,
        req.body.nom,
        req.body.email,
        req.body.telephone,
        req.body.mot_de_passe
    ];
    
    const [utilisateurExiste] = db.query(
        'SELECT * FROM utilisateur WHERE email = ? OR identifiant = ?',
        [email, identifiant]
    );
    
    if (utilisateurExiste.length > 0) {
        return res.status(409).json({
            success: false,
            message: "Cet email ou identifiant est déjà utilisé"
        });
    }
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

//page d'acceuil
app.get('/', function (req, res) {
    const query = `
        SELECT t.isbn, t.numero_volume, t.prix, t.image, t.serie_id_serie, s.titre_serie 
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
    `;

    con.query(query, function (err, result) {
        if (err) throw err;

        res.render("pages/index", {
            tomes: result 
        });
    });
});