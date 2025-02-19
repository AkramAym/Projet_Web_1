

CREATE TABLE adresse (
    id_adresse                          INT NOT NULL AUTO_INCREMENT, 
    rue                                 VARCHAR(20) NOT NULL,
    numero_adresse                      INT NOT NULL,
    code_postal                         VARCHAR(7) NOT NULL,
    ville                               VARCHAR(20) NOT NULL,
    pays                                VARCHAR(20) NOT NULL,
    province                            VARCHAR(20) NOT NULL,
    utilisateur_identifiant_utilisateur VARCHAR(10) NOT NULL,
    PRIMARY KEY (id_adresse) 
);

CREATE TABLE article_commande (
    id_article           INT NOT NULL AUTO_INCREMENT, 
    quantite             INT NOT NULL,
    commande_id_commande INT NOT NULL,
    tome_isbn            INT NOT NULL,
    PRIMARY KEY (id_article)
);

CREATE TABLE article_panier (
    id_article_panier INT NOT NULL AUTO_INCREMENT, 
    tome_isbn         INT NOT NULL,
    panier_id_panier  INT NOT NULL,
    quantite          INT,
    PRIMARY KEY (id_article_panier) 
);

CREATE TABLE categorie (
    id_categorie  INT AUTO_INCREMENT NOT NULL, 
    nom_categorie VARCHAR(20) NOT NULL,
    description   VARCHAR(500) NOT NULL,
    PRIMARY KEY (id_categorie) 
);

CREATE TABLE commande (
    id_commande                         INT NOT NULL AUTO_INCREMENT,
    date_commande                       DATE NOT NULL,
    montant_total                       DECIMAL(10,2) NOT NULL,
    utilisateur_identifiant_utilisateur VARCHAR(10) NOT NULL,
    adresse_id_adresse                  INT NOT NULL,
    PRIMARY KEY (id_commande) 
);

CREATE TABLE emprunt (
    id_emprunt                          INT NOT NULL AUTO_INCREMENT,
    date_emprunt                        DATE NOT NULL,
    date_retour                         DATE NOT NULL,
    statut                              VARCHAR(20) NOT NULL,
    utilisateur_identifiant_utilisateur VARCHAR(10) NOT NULL,
    tome_isbn                           INT NOT NULL,
    adresse_id_adresse                  INT,
    date_retournee                      DATE,
    PRIMARY KEY (id_emprunt) 
);

CREATE TABLE evaluation (
    id_evaluation           INT NOT NULL AUTO_INCREMENT, 
    note                    INT NOT NULL,
    commentaire             VARCHAR(200),
    date_note               DATE NOT NULL,
    tome_isbn               INT NOT NULL,
    identifiant_utilisateur VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_evaluation) 
);

CREATE TABLE historique (
    id_historique                       INT NOT NULL AUTO_INCREMENT,
    `type`                              VARCHAR(10) NOT NULL,
    utilisateur_identifiant_utilisateur VARCHAR(10) NOT NULL,
    commande_id_commande                INT NOT NULL,
    emprunt_id_emprunt                  INT NOT NULL,
    PRIMARY KEY (id_historique) 
);

CREATE TABLE panier (
    id_panier                           INT NOT NULL AUTO_INCREMENT, 
    date_creation                       DATE NOT NULL,
    u_identifiant_utilisateur           VARCHAR(10) NOT NULL,
    PRIMARY KEY (id_panier) 
);

CREATE TABLE serie (
    id_serie               INT AUTO_INCREMENT NOT NULL,
    titre_serie            VARCHAR(20) NOT NULL,
    auteur                 VARCHAR(20) NOT NULL,
    editeur                VARCHAR(20) NOT NULL,
    synopsis               VARCHAR(2000) NOT NULL,
    categorie_id_categorie INT NOT NULL,
    PRIMARY KEY (id_serie) 
);

CREATE TABLE tome (
    isbn              DECIMAL(13) NOT NULL, 
    numero_volume     INT NOT NULL,
    annee_publication DATE NOT NULL,
    serie_id_serie    INT NOT NULL,
    prix              DECIMAL(10,2) NOT NULL,
    image             VARCHAR(255) NOT NULL,
    stock             INT NOT NULL,
    PRIMARY KEY (isbn) 
);

CREATE TABLE utilisateur (
    identifiant_utilisateur VARCHAR(10) NOT NULL, 
    nom                     VARCHAR(10) NOT NULL,
    prenom                  VARCHAR(10) NOT NULL,
    mot_de_passe            VARCHAR(20) NOT NULL,
    adresse_electronique    VARCHAR(25) NOT NULL,
    telephone               VARCHAR(15),
    PRIMARY KEY (identifiant_utilisateur) 
);


ALTER TABLE adresse
    ADD CONSTRAINT adresse_utilisateur_fk 
    FOREIGN KEY (utilisateur_identifiant_utilisateur) 
    REFERENCES utilisateur(identifiant_utilisateur);

ALTER TABLE article_commande
    ADD CONSTRAINT article_commande_commande_fk 
    FOREIGN KEY (commande_id_commande) 
    REFERENCES commande(id_commande);

ALTER TABLE article_commande
    ADD CONSTRAINT article_commande_tome_fk 
    FOREIGN KEY (tome_isbn) 
    REFERENCES tome(isbn);

ALTER TABLE article_panier
    ADD CONSTRAINT article_panier_panier_fk 
    FOREIGN KEY (panier_id_panier) 
    REFERENCES panier(id_panier);

ALTER TABLE article_panier
    ADD CONSTRAINT article_panier_tome_fk 
    FOREIGN KEY (tome_isbn) 
    REFERENCES tome(isbn);

ALTER TABLE commande
    ADD CONSTRAINT commande_adresse_fk 
    FOREIGN KEY (adresse_id_adresse) 
    REFERENCES adresse(id_adresse);

ALTER TABLE commande
    ADD CONSTRAINT commande_utilisateur_fk 
    FOREIGN KEY (utilisateur_identifiant_utilisateur) 
    REFERENCES utilisateur(identifiant_utilisateur);

ALTER TABLE emprunt
    ADD CONSTRAINT emprunt_adresse_fk 
    FOREIGN KEY (adresse_id_adresse) 
    REFERENCES adresse(id_adresse);

ALTER TABLE emprunt
    ADD CONSTRAINT emprunt_tome_fk 
    FOREIGN KEY (tome_isbn) 
    REFERENCES tome(isbn);

ALTER TABLE emprunt
    ADD CONSTRAINT emprunt_utilisateur_fk 
    FOREIGN KEY (utilisateur_identifiant_utilisateur) 
    REFERENCES utilisateur(identifiant_utilisateur);

ALTER TABLE evaluation
    ADD CONSTRAINT evaluation_tome_fk 
    FOREIGN KEY (tome_isbn) 
    REFERENCES tome(isbn);

ALTER TABLE evaluation
    ADD CONSTRAINT evaluation_utilisateur_fk 
    FOREIGN KEY (identifiant_utilisateur) 
    REFERENCES utilisateur(identifiant_utilisateur);

ALTER TABLE historique
    ADD CONSTRAINT historique_commande_fk 
    FOREIGN KEY (commande_id_commande) 
    REFERENCES commande(id_commande);

ALTER TABLE historique
    ADD CONSTRAINT historique_emprunt_fk 
    FOREIGN KEY (emprunt_id_emprunt) 
    REFERENCES emprunt(id_emprunt);

ALTER TABLE historique
    ADD CONSTRAINT historique_utilisateur_fk 
    FOREIGN KEY (utilisateur_identifiant_utilisateur) 
    REFERENCES utilisateur(identifiant_utilisateur);

ALTER TABLE panier
    ADD CONSTRAINT panier_utilisateur_fk 
    FOREIGN KEY (u_identifiant_utilisateur) 
    REFERENCES utilisateur(identifiant_utilisateur);

ALTER TABLE serie
    ADD CONSTRAINT serie_categorie_fk 
    FOREIGN KEY (categorie_id_categorie) 
    REFERENCES categorie(id_categorie);

ALTER TABLE tome
    ADD CONSTRAINT tome_serie_fk 
    FOREIGN KEY (serie_id_serie) 
    REFERENCES serie(id_serie);

DROP USER 'scott'@'%';
CREATE USER 'scott'@'%' IDENTIFIED WITH mysql_native_password BY 'oracle';
GRANT ALL PRIVILEGES ON *.* TO 'scott'@'%';
FLUSH PRIVILEGES;

INSERT INTO categorie (nom_categorie, description)
VALUES 
    ('Shonen', 'Le Shonen est un genre de manga principalement destiné à un public jeune masculin. Il se caractérise par des histoires dynamiques, souvent axées sur l\'action, l\'aventure, l\'amitié et la persévérance. Exemples populaires : "Naruto", "Dragon Ball", "One Piece".'),
    ('Seinen', 'Le Seinen est un genre de manga ciblant un public adulte masculin. Les thèmes abordés sont souvent plus matures et complexes, incluant la psychologie, la politique, la violence ou la science-fiction. Exemples populaires : "Berserk", "Tokyo Ghoul", "Ghost in the Shell".'),
    ('Shojo', 'Le Shojo est un genre de manga destiné à un public jeune féminin. Il met souvent l\'accent sur les relations interpersonnelles, les romances, les drames et les émotions. Le style artistique est généralement plus raffiné et expressif. Exemples populaires : "Fruits Basket", "Nana", "Sailor Moon".');

INSERT INTO serie (titre_serie, auteur, editeur, synopsis, categorie_id_categorie)
VALUES (
    'Jujutsu Kaisen', 
    'Gege Akutami', 
    'Shūeisha', 
    'Plus de 10 000 morts et disparus sont recensés chaque année au Japon. Les sentiments négatifs que relâchent les êtres humains sont en cause. Souffrance, regrets, humiliation : leur concentration dans un même endroit engendre des malédictions souvent mortelles... C''est ce que va découvrir Yuji Itadori, lycéen et membre du club d''occultisme. Il ne croit pas aux fantômes, mais il est doté d''une force physique hors norme qui représente un véritable atout pour les missions du groupe... jusqu''à ce que l''une d''elles prenne une mauvaise tournure. La relique qu''ils dénichent, le doigt découpé d''un démon millénaire, attire les monstres ! Sans réfléchir : le jeune homme avale la relique pour briser la malédiction ! Maintenant, il se trouve possédé par Ryômen Sukuna, le célèbre démon à deux visages. Cependant, contre toute attente, Yuji est toujours capable de garder le contrôle de son corps. Mais en dépit de cela, il est condamné à mort par l''organisation des exorcistes... Une décision qui ne pourra être repoussée qu''à une seule condition : trouver tous les doigts de Sukuna afin d''écarter la menace une bonne fois pour toutes !', 
    1
);

INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9791032705544, 
    1, 
    '2020-07-21', 
    1, 
    16.00, 
    '/images/kaisen.jpg', 
    5
);