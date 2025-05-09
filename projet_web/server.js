import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import MongoStore from "connect-mongo";
import con from './mysqlbd.js';
import mongocon from './mongodb.js';
import routeur from "./routes/routeur.js";
import rechercheRouteur from "./routes/recherche.js";

const app = express();

// Chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Désactive le cache du navigateur pour les requêtes GET
app.use((req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  });

app.use(session({
    secret: "yahou",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: MongoStore.create({ client: mongocon })
}));

app.use(async (req, res, next) => {
    if (req.session.user?.identifiant) {
        const notification = await mongocon.db("MangathequeBD").collection("notification").countDocuments({
                utilisateur_identifiant: req.session.user.identifiant,
                lu: false
            });
        res.locals.notificationNonLue = notification;
    } else {
        res.locals.notificationNonLue = 0;
    }
    next();
});

// Routes
app.use(rechercheRouteur);
app.use(routeur);

// Redirection ancienne URL
app.get('/tome/:isbn', (req, res) => {
    res.redirect(301, '/tomes/' + req.params.isbn);
});

// Accueil
app.get('/', function (req, res) {
    req.session.visited = true;
    const query = `
        SELECT t.isbn, t.numero_volume, t.prix, t.image, t.serie_id_serie, s.titre_serie 
        FROM tome t
        JOIN serie s ON t.serie_id_serie = s.id_serie
        WHERE t.numero_volume = 1
    `;

    const utilisateurConnecte = !!req.session.user?.identifiant;

    con.query(query, function (err, result) {
        if (err) throw err;

        result.forEach(obj => {
            obj.prix = obj.prix.toFixed(2);
        });

        res.render("pages/index", {
            tomes: result,
            connecte: utilisateurConnecte
        });
    });
});

// Démarrage
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
