import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Définition du dossier contenant les vues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route principale (Page d'accueil)

app.get('/', (req, res) => {
    res.render('pages/index');
});
//  Route pour afficher la page d'inscription
app.get('/inscription', (req, res) => {
    res.render('pages/inscription'); 
});

app.get('/connexion', (req, res) => {
    res.render('pages/connexion'); 
});
// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
