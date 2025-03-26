
// Gestion de l'affichage du mot de passe
document.querySelectorAll('.toggle-password').forEach(item => {
    item.addEventListener('click', function() {
        let passwordField = this.previousElementSibling;
        if (passwordField.type === "password") {
            passwordField.type = "text";
        } else {
            passwordField.type = "password";
        }
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
