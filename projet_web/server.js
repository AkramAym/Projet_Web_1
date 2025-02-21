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
    res.render('pages/inscription', {
        message: null
    });
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
    console.log(req.body);
    const { identifiant, prenom, nom, email, telephone, mot_de_passe, motDePasseConfirme } = req.body;

    con.query('Select email FROM utilisateur WHERE email = ?', [email], (error, results) => { 
        if(error) {
            console.log(error);
        }

        if(results.length > 0){
            return res.render('pages/inscription', {
                message: 'Email deja utilise'
            })
        }else if(mot_de_passe != motDePasseConfirme){
            return res.render('pages/inscription', {
                message: 'Le mots de passe ne sont pas pareils'
            })
        }
    })

    con.query('INSERT INTO utilisateur SET ?', {identifiant, prenom, nom, mot_de_passe, email, telephone}, (error, results) =>{
        if (error){
            console.log(error);
        } else {
            console.log(results, {
                message: 'Utilisateur enregistre'
            });
        }
    })

 
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

