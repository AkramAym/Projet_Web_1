 import  { Router} from "express";
 import express from "express";
 import mysql from "mysql";

 const routeur = Router();
 routeur.use(express.urlencoded({ extended: false }));
 routeur.use(express.json());

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

 // Route pour afficher la page d'inscription
routeur.get('/inscription', (req, res) => {
    res.render('pages/inscription', {
        message: null
    });
});

// Route pour afficher la page de connexion
routeur.get('/connexion', (req, res) => {
    res.render('pages/connexion');
});

routeur.post("/connexion", function (req, res) {
const { identifiant, mot_de_passe } = req.body;

con.query('SELECT identifiant, mot_de_passe FROM utilisateur WHERE identifiant = ?', [identifiant], (error, results) => {
    if(error) {
        console.log(error);
        throw error;
    }

    if(results.length <= 0){
        return res.render('pages/connexion', {
            message: 'Identifiant inexistant'
        })
    }else {
        const mot_de_passeUtilisateur = results.mot_de_passe;
        if (mot_de_passe != mot_de_passeUtilisateur){
            return res.render('pages/connexion', {
                message: 'Mauvais mot de passe'
            })
        }
    }
})

});
// Route pour gérer l'inscription (POST)
routeur.post("/inscription", function (req, res) {
    console.log(req.body);
    const { identifiant, prenom, nom, email, telephone, mot_de_passe, motDePasseConfirme } = req.body;

    con.query('SELECT email, identifiant FROM utilisateur WHERE email = ?', [email], (error, results) => { 
        if(error) {
            console.log(error);
            throw error;
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
            return res.render("pages/index");
        }
    })
});
 export default routeur;

