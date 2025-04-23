document.addEventListener("DOMContentLoaded", () => {
    const searchToggle = document.getElementById("search-toggle")
    const searchBarContainer = document.getElementById("search-bar-container")
    const searchClose = document.getElementById("search-close")
    const searchOverlay = document.getElementById("search-overlay")
    const searchInput = document.getElementById("search-input")
  
    // Ouvrir la barre de recherche
    searchToggle.addEventListener("click", (e) => {
      e.preventDefault()
      searchBarContainer.classList.add("active")
      searchOverlay.classList.add("active")
      document.body.classList.add("search-active")
      searchInput.focus()
    })
  
    // Fermer la barre de recherche
    searchClose.addEventListener("click", () => {
      searchBarContainer.classList.remove("active")
      searchOverlay.classList.remove("active")
      document.body.classList.remove("search-active")
      searchInput.value = ""
    })
  
    // Fermer la barre de recherche en cliquant sur l'overlay
    searchOverlay.addEventListener("click", () => {
      searchClose.click()
    })
  })
  