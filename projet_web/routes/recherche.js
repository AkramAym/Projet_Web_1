import express from "express";
import con from "../mysqlbd.js";

const router = express.Router();

// Recherche AJAX (pour search.js)
router.get("/recherche", (req, res) => {
  const query = req.query.q;

  if (!query || query.length < 2) {
    return res.json([]);
  }

  const searchParam = `%${query}%`;

  const sql = `
    SELECT 
      t.isbn, 
      t.numero_volume, 
      t.image, 
      s.titre_serie,
      s.auteur
    FROM 
      serie s
    JOIN 
      tome t ON s.id_serie = t.serie_id_serie
    WHERE 
      s.titre_serie LIKE ?
    ORDER BY 
      s.titre_serie ASC, 
      t.numero_volume ASC
    LIMIT 20
  `;

  con.query(sql, [searchParam], (err, results) => {
    if (err) {
      console.error("Erreur SQL recherche:", err);
      return res.status(500).json({ error: "Erreur lors de la recherche." });
    }

    res.json(results);
  });
});

// Page de résultats complète
router.get("/recherche-page", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.render("pages/recherche", {
      resultats: [],
      terme: "",
      erreur: null,
      connecte: !!req.session?.user,
    });
  }

  const searchParam = `%${query}%`;

  const sql = `
    SELECT 
      t.isbn, 
      t.numero_volume, 
      t.image, 
      t.prix,
      s.titre_serie,
      s.auteur,
      s.editeur
    FROM 
      serie s
    JOIN 
      tome t ON s.id_serie = t.serie_id_serie
    WHERE 
      s.titre_serie LIKE ?
    ORDER BY 
      s.titre_serie ASC, 
      t.numero_volume ASC
  `;

  con.query(sql, [searchParam], (err, results) => {
    if (err) {
      console.error("Erreur SQL recherche page:", err);
      return res.render("pages/recherche", {
        resultats: [],
        terme: query,
        erreur: "Erreur lors de la recherche.",
        connecte: !!req.session?.user,
      });
    }

    res.render("pages/recherche", {
      resultats: results,
      terme: query,
      erreur: null,
      connecte: !!req.session?.user,
    });
  });
});

export default router;
