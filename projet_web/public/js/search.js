document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input")
  const searchResults = document.getElementById("search-results")
  let searchTimeout

  // Fonction pour effectuer la recherche
  function performSearch() {
    const query = searchInput.value.trim()

    if (query.length < 2) {
      searchResults.classList.remove("active")
      return
    }

    // Afficher l'interface de recherche
    searchResults.classList.add("active")
    searchResults.innerHTML = '<div class="searching">Recherche en cours...</div>'

    // Effectuer la requête AJAX
    fetch(`/recherche?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          searchResults.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>'
        } else {
          let html = '<div class="product-grid">'
          data.forEach((manga) => {
            const prixAffiche = manga.prix || 0
            let prixOriginal = ""

            // Si on a un prix original différent, on l'affiche barré
            if (manga.prix_original && manga.prix_original > manga.prix) {
              prixOriginal = `<span class="original-price">${manga.prix_original.toFixed(2)} $</span>`
            }

            html += `
              <a href="/tome/${manga.isbn}" class="product-item">
                <div class="product-image">
                  <img src="${manga.image}" alt="${manga.titre_serie}">
                </div>
                <div class="product-info">
                  <h3 class="product-title">${manga.titre_serie}${manga.numero_volume ? ` - Vol. ${manga.numero_volume}` : ""}</h3>
                  <div class="product-price">
                    ${prixOriginal}
                    <span class="current-price">${prixAffiche.toFixed(2)} $</span>
                  </div>
                </div>
              </a>
            `
          })
          html += "</div>"
          searchResults.innerHTML = html
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche:", error)
        searchResults.innerHTML = '<div class="no-results">Une erreur est survenue</div>'
      })
  }

  // Événements
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(performSearch, 300)
  })

  // Soumettre le formulaire lors de l'appui sur Entrée
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      document.querySelector(".search-form").submit()
    }
  })
})
