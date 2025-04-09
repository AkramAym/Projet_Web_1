document.addEventListener("DOMContentLoaded", () => {
    // Éléments du DOM
    const profileButton = document.getElementById("profile-button")
    const profileDropdown = document.getElementById("profile-dropdown")
    const profileOverlay = document.getElementById("profile-overlay")
    const closeProfileButton = document.getElementById("close-profile")
  
    if (!profileButton || !profileDropdown || !profileOverlay || !closeProfileButton) {
      console.error("Un ou plusieurs éléments du profil n'ont pas été trouvés")
      return
    }
  
    // Fonction pour ouvrir le menu du profil
    function openProfileMenu(e) {
      e.preventDefault()
      profileOverlay.style.display = "block"
      profileDropdown.classList.add("active")
      document.body.style.overflow = "hidden" // Empêcher le défilement
    }
  
    // Fonction pour fermer le menu du profil
    function closeProfileMenu() {
      profileOverlay.style.display = "none"
      profileDropdown.classList.remove("active")
      document.body.style.overflow = "" // Réactiver le défilement
    }
  
    // Événements
    profileButton.addEventListener("click", openProfileMenu)
  
    closeProfileButton.addEventListener("click", closeProfileMenu)
  
    profileOverlay.addEventListener("click", closeProfileMenu)
  
    // Fermer le menu avec la touche Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && profileDropdown.classList.contains("active")) {
        closeProfileMenu()
      }
    })
  })
  