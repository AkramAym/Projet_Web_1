import express from "express"
import con from "../mysqlbd.js"

const router = express.Router()

// Recherche AJAX (pour search.js)
router.get("/recherche", (req, res) => {
  const query = req.query.q

  if (!query || query.length < 2) {
    return res.json([])
  }

  const searchParam = `%${query}%`

  const sql = `
    SELECT 
      t.isbn, 
      t.numero_volume, 
      t.image, 
      t.prix,
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
  `

  con.query(sql, [searchParam], (err, results) => {
    if (err) {
      console.error("Erreur SQL recherche:", err)
      return res.status(500).json({ error: "Erreur lors de la recherche." })
    }

    res.json(results)
  })
})

// Page de résultats complète
router.get("/recherche-page", (req, res) => {
  const query = req.query.q
  const sort = req.query.sort || "relevance" // Par défaut, trier par pertinence

  if (!query) {
    return res.render("pages/recherche", {
      resultats: [],
      terme: "",
      erreur: null,
      connecte: !!req.session?.user,
      sort: sort,
    })
  }

  // Vérifier si la recherche est pour "manga" (afficher tous les mangas)
  const isAllMangaSearch = query.toLowerCase() === "manga"

  // Déterminer l'ordre de tri en fonction du paramètre sort
  let orderByClause = ""
  if (sort === "asc") {
    orderByClause = "t.prix ASC"
  } else if (sort === "desc") {
    orderByClause = "t.prix DESC"
  } else {
    // Par défaut (relevance), trier par titre et numéro de volume
    orderByClause = "s.titre_serie ASC, t.numero_volume ASC"
  }

  // SQL pour tous les mangas si la recherche est "manga"
  const sqlAllMangas = `
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
    ORDER BY 
      ${orderByClause}
  `

  // SQL pour la recherche normale
  const sqlNormal = `
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
      ${orderByClause}
  `

  const searchParam = `%${query}%`

  // Exécuter la requête appropriée
  if (isAllMangaSearch) {
    con.query(sqlAllMangas, (err, results) => {
      if (err) {
        console.error("Erreur SQL recherche page:", err)
        return res.render("pages/recherche", {
          resultats: [],
          terme: query,
          erreur: "Erreur lors de la recherche.",
          connecte: !!req.session?.user,
          sort: sort,
        })
      }

      res.render("pages/recherche", {
        resultats: results,
        terme: query,
        erreur: null,
        connecte: !!req.session?.user,
        sort: sort,
      })
    })
  } else {
    con.query(sqlNormal, [searchParam], (err, results) => {
      if (err) {
        console.error("Erreur SQL recherche page:", err)
        return res.render("pages/recherche", {
          resultats: [],
          terme: query,
          erreur: "Erreur lors de la recherche.",
          connecte: !!req.session?.user,
          sort: sort,
        })
      }

      res.render("pages/recherche", {
        resultats: results,
        terme: query,
        erreur: null,
        connecte: !!req.session?.user,
        sort: sort,
      })
    })
  }
})

export default router
