document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector(".search-bar")
    const searchInput = searchForm.querySelector('input[type="search"]')
    const searchButton = searchForm.querySelector("button")
    const searchOverlay = document.createElement("div")
    const searchResults = document.createElement("div")
  
    // Créer l'overlay qui assombrit le reste de la page
    searchOverlay.className = "search-overlay"
    searchOverlay.style.display = "none"
    document.body.appendChild(searchOverlay)
  
    // Créer le conteneur de résultats
    searchResults.className = "search-results"
    searchResults.style.display = "none"
    searchForm.appendChild(searchResults)
  
    // Fonction pour activer la recherche
    function activateSearch() {
      searchOverlay.style.display = "block"
      searchForm.classList.add("search-active")
      searchResults.style.display = "block"
      document.body.classList.add("search-mode")
    }
  
    // Fonction pour désactiver la recherche
    function deactivateSearch() {
      searchOverlay.style.display = "none"
      searchForm.classList.remove("search-active")
      searchResults.style.display = "none"
      document.body.classList.remove("search-mode")
    }
  
    // Événement pour activer la recherche au clic sur l'input
    searchInput.addEventListener("click", (e) => {
      activateSearch()
      // Si l'input a déjà une valeur de 2 caractères ou plus, lancer la recherche
      if (searchInput.value.trim().length >= 2) {
        performSearch(searchInput.value.trim())
      }
    })
  
    // Événement pour activer la recherche au focus sur l'input
    searchInput.addEventListener("focus", (e) => {
      activateSearch()
      // Si l'input a déjà une valeur de 2 caractères ou plus, lancer la recherche
      if (searchInput.value.trim().length >= 2) {
        performSearch(searchInput.value.trim())
      }
    })
  
    // Événement pour fermer la recherche quand on clique sur l'overlay
    searchOverlay.addEventListener("click", (e) => {
      deactivateSearch()
    })
  
    // Fonction pour effectuer la recherche
    function performSearch(query) {
      console.log("Recherche en cours pour:", query)
  
      // Afficher un message de chargement
      searchResults.innerHTML = '<div class="searching">Recherche en cours...</div>'
  
      // Appel AJAX pour rechercher les mangas
      fetch(`/recherche?q=${encodeURIComponent(query)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          console.log("Données reçues:", data)
          searchResults.innerHTML = ""
  
          if (data.error) {
            searchResults.innerHTML = `<div class="no-results">Erreur: ${data.error}</div>`
            return
          }
  
          if (data.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>'
            return
          }
  
          // Afficher les résultats
          data.forEach((manga) => {
            const resultItem = document.createElement("div")
            resultItem.className = "result-item"
            resultItem.innerHTML = `
              <img src="${manga.image}" alt="${manga.titre_serie}" class="result-image">
              <div class="result-info">
                <div class="result-title">${manga.titre_serie}</div>
                <div class="result-subtitle">Tome ${manga.numero_volume}</div>
              </div>
            `
  
            resultItem.addEventListener("click", () => {
              window.location.href = `/tome/${manga.isbn}`
            })
  
            searchResults.appendChild(resultItem)
          })
        })
        .catch((error) => {
          console.error("Erreur de recherche:", error)
          searchResults.innerHTML = '<div class="no-results">Erreur lors de la recherche</div>'
        })
    }
  
    // Événement pour la recherche en temps réel
    let debounceTimer
    searchInput.addEventListener("input", (e) => {
      const query = searchInput.value.trim()
  
      // Effacer le timer précédent
      clearTimeout(debounceTimer)
  
      // Ne rien faire si moins de 2 caractères
      if (query.length < 2) {
        searchResults.innerHTML = '<div class="no-results">Entrez au moins 2 caractères</div>'
        return
      }
  
      // Attendre 300ms avant de lancer la recherche pour éviter trop de requêtes
      debounceTimer = setTimeout(() => {
        performSearch(query)
      }, 300)
    })
  
    // Empêcher la soumission du formulaire par défaut
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const query = searchInput.value.trim()
  
      if (query.length >= 2) {
        window.location.href = `/recherche-page?q=${encodeURIComponent(query)}`
      } else {
        // Afficher un message si moins de 2 caractères
        searchResults.innerHTML = '<div class="no-results">Entrez au moins 2 caractères</div>'
        searchResults.style.display = "block"
      }
    })
  })
  