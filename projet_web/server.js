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
        tome.prix = tome.prix.toFixed(2); // Formater le prix à deux décimales

        const utilisateurConnecte = req.session.user?.identifiant ? true : false;

        // Rendu de la page avec les informations du manga et la variable 'connecte'
        res.render("pages/tome", {
            tome: tome,
            connecte: utilisateurConnecte // Envoi de la variable 'connecte'
        });
    });
});


// Ajouter un tome au panier
app.post('/panier/:isbn', (req, res) => {
    console.log(`Ajout au panier : ISBN = ${req.params.isbn}, Quantité = ${req.body.quantite}`);
    const isbn = req.params.isbn;
    const quantite = parseInt(req.body.quantite) || 1; // Quantité par défaut = 1

    // Vérifier si l'utilisateur est connecté
    if (!req.session.user) {
        console.log("Utilisateur non connecté");
        return res.status(401).send("Vous devez être connecté pour ajouter un article au panier.");
    }

    const utilisateurId = req.session.user.identifiant;

    // Vérifier si le panier de l'utilisateur existe (ou le créer si nécessaire)
    const queryCheckPanier = `
        INSERT IGNORE INTO panier (utilisateur_identifiant)
        VALUES (?)
    `;

    con.query(queryCheckPanier, [utilisateurId], (err) => {
        if (err) {
            console.error("Erreur lors de la vérification/création du panier :", err);
            return res.status(500).send("Erreur lors de la vérification/création du panier.");
        }

        // Ajouter ou mettre à jour l'article dans le panier
        const queryAjoutArticle = `
            INSERT INTO article_panier (panier_utilisateur_identifiant, tome_isbn, quantite)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantite = quantite + ?
        `;

        con.query(queryAjoutArticle, [utilisateurId, isbn, quantite, quantite], (err) => {
            if (err) {
                console.error("Erreur lors de l'ajout au panier :", err);
                return res.status(500).send("Erreur lors de l'ajout au panier.");
            }

            console.log(`Article ISBN ${isbn} ajouté au panier pour l'utilisateur ${utilisateurId}, quantité : ${quantite}`);
            res.redirect('/panier'); // Redirige vers la page du panier après l'ajout
        });
    });
});

