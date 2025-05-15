
// Gestion de l'affichage du mot de passe
document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".toggle-password");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function () {
      // Trouve l'input dans le même parent
      const input = this.closest('.password-container').querySelector('input');
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
});


// Fonction de validation du formulaire
function validerFormulaire() {
    let email = document.getElementById("email").value;
    let motDePasse = document.getElementById("mot_de_passe").value;
    let motDePasseConfirme = document.getElementById("motDePasseConfirme").value;
    let messageErreur = document.getElementById("erreur-message");

    // Vérification de l'email (doit contenir un "." après "@")
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        messageErreur.innerText = "L'email doit contenir un '.' après le '@'.";
        messageErreur.style.display = "block";
        return false;
    }

    // Vérification du mot de passe
    let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(motDePasse)) {
        messageErreur.innerText = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
        messageErreur.style.display = "block";
        return false;
    }

    // Vérification de la confirmation du mot de passe
    if (motDePasse !== motDePasseConfirme) {
        messageErreur.innerText = "Les mots de passe ne correspondent pas.";
        messageErreur.style.display = "block";
        return false;
    }

    messageErreur.style.display = "none";
    return true; // Si toutes les validations passent
}
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter un manga au panier (animation)
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const button = this;
            const cartTab = document.querySelector('.cart-container');
            cartTab.classList.add('show'); // Applique une classe pour afficher un onglet

            // Animation (exemple)
            const animationDiv = document.createElement('div');
            animationDiv.classList.add('animation');
            document.body.appendChild(animationDiv);
            animationDiv.style.animation = 'fadeIn 1s'; // Animation d'apparition

            setTimeout(() => {
                animationDiv.remove(); // Supprime l'animation après 1 seconde
            }, 1000);
        });
    });
});

// Animation CSS
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animation {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 15px;
        border-radius: 8px;
    }
`;
document.head.appendChild(style);
// Calculate totals on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get all item prices and quantities
    const items = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    
    items.forEach(item => {
      const priceText = item.querySelector('.item-price').textContent.trim();
      const price = parseFloat(priceText.replace('$', '').trim());
      
      const quantitySelect = item.querySelector('select');
      const quantity = parseInt(quantitySelect.value);
      
      subtotal += price * quantity;
      
      // Update quantity change event
      quantitySelect.addEventListener('change', function() {
        location.reload(); // Reload to recalculate server-side
        // Alternatively, you could implement AJAX to update without reload
      });
    });
    
    // Calculate shipping (free if over 50$, otherwise 5$)
    const shipping = subtotal >= 50 ? 0 : 5;
    
    // Calculate taxes (assume 15%)
    const taxes = subtotal * 0.15;
    
    // Calculate total
    const total = subtotal + shipping + taxes;
    
    // Update summary
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 4) {
      // Update subtotal
      summaryRows[0].querySelector('.price').textContent = subtotal.toFixed(2) + ' $';
      
      // Update shipping
      const shippingText = shipping === 0 ? 'GRATUIT' : shipping.toFixed(2) + ' $';
      summaryRows[1].querySelector('.price').textContent = shippingText;
      
      // Update taxes
      summaryRows[2].querySelector('.price').textContent = taxes.toFixed(2) + ' $';
      
      // Update total
      summaryRows[3].querySelector('.price').textContent = total.toFixed(2) + ' $';
    }
  });