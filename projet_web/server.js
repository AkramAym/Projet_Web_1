import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";
import dateFormat from "dateformat";
import cookieParser from "cookieparser";
import con from './mysqlbd.js';
import mongocon from './mongodb.js';
import MongoStore from "connect-mongo";
import routeur from "./routes/routeur.js";


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

app.use(routeur);

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

        result.forEach(objet => {
            objet.prix = objet.prix.toFixed(2);
        });
        
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


console.log(path.join(__dirname, 'views'));


// Route pour afficher la page d'un manga (tome)
app.get('/tome/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const query = `
        SELECT t.isbn, t.numero_volume, t.annee_publication, t.prix, t.image, t.stock, s.titre_serie, s.auteur, s.synopsis 
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE t.isbn = ?`;

    con.query(query, [isbn], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Erreur serveur");
        }

        if (result.length === 0) {
            return res.status(404).send("Manga non trouvé");
        }

        const tome = result[0];
        tome.prix = tome.prix.toFixed(2);

        const utilisateurConnecte = req.session.user?.identifiant ? true : false;

        res.render("pages/tome", {
            tome: tome,
            connecte: utilisateurConnecte,
            isFavori: false // ou vraie valeur plus tard
        });
    });
});



