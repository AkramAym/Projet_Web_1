
import express from 'express';
import authRouteur from './authentification.js';
import rechercheRouteur from './recherche.js';
import panierRouteur from './panier.js';
import commandesRouteur from './commande.js';
import empruntsRouteur from './emprunt.js';
import avisRouteur from './avis.js';
import favorisRouteur from './favoris.js';
import mangaRouteur from './mangas.js';

const routeur = express.Router();

routeur.use(authRouteur);

routeur.use(rechercheRouteur);

routeur.use(panierRouteur);

routeur.use(commandesRouteur);

routeur.use(empruntsRouteur);

routeur.use(avisRouteur);

routeur.use(favorisRouteur);

routeur.use(mangaRouteur);

export default routeur;
