# Mangathèque - Déploiement de l'Application

Ce document explique comment installer et exécuter l'application **Mangathèque**, une bibliothèque de mangas en ligne permettant d'acheter et d'emprunter des mangas.

##  Prérequis

Avant de commencer l'installation, assurez-vous d'avoir installé les éléments suivants :

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [VSCode]
- [GitHub Desktop ou Gitbash](https://github.com/apps/desktop ou https://git-scm.com/downloads)

##  Installation

### 1️ Cloner le projet 

### **Option 1 : Clonage via Git Bash (recommandé)**
Ouvrez GitBash
Aller dans le dossier où vous voulez stocker le projet (ex: `Documents`) :
```bash
cd ~/Documents
git clone https://github.com/AkramAym/Projet_Web_1.git
```



Ouvrez GitHub Desktop et connectez vous à votre compte GitHub
Faites "Ctrl + shift + O"
Allez dans la section URL et dans "URL or username/repository" entrez : https://github.com/AkramAym/Projet_Web_1.git
Choisissez le dossier de destination
Cliquer sur clone

### 2 Installer les dépendances
Assurez vous d'être dans le dossier du projet avec Github Desktop, faites clic droit sur le projet et cliquer sur "Open in command prompt", puis cd mangatheque
Avec GitBash faites cd Projet_Web_1/mangatheque
Une fois que vous êtes dans le bon dossier, faites npm install

### 3 Configurer la base de données
Assurez vous que docker est installé avec : "docker --version"
Ensuite, entrez l'invite de commande suivant :
docker run -d -p 3306:3306 --name mysql-server -e LANG=C.UTF-8 -e MYSQL_ROOT_PASSWORD=oracle -e MYSQL_DATABASE=scott -e MYSQL_USER=scott -e MYSQL_PASSWORD=oracle mysql/mysql-server:latest
Ensuite ouvrez docker desktop et démarrer le container.
Allez dans la section "Exec" du container.
Entrez la commande : mysql -u root -p
Entrez le mot de passe : oracle
Copiez le script contenu dans "script_bd.sql" et collez le dans docker en faisant clic droit puis cliquez sur "Paste"

### 4 Démarrez l'application
Avec le même invite de commande faites :
npx nodemon server.js
Puis ouvrez votre navigateur et entrez :
http://localhost:3000

Projet développé dans le cadre de [Applications Web Transactionnels/Livrabe #2 : Prototoype 1] - [Bois de Boulogne]