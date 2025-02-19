
DROP DATABASE IF EXISTS MangathequeBD;


CREATE DATABASE MangathequeBD;


USE MangathequeBD;


DROP TABLE IF EXISTS adresse, article_commande, article_panier, categorie, commande, emprunt, evaluation, historique, panier, serie, tome, utilisateur;

CREATE TABLE adresse (
    id_adresse                          INT AUTO_INCREMENT NOT NULL, 
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
    id_article           INT AUTO_INCREMENT NOT NULL, 
    quantite             INT NOT NULL,
    commande_id_commande INT NOT NULL,
    tome_isbn            INT NOT NULL,
    PRIMARY KEY (id_article)
);

CREATE TABLE article_panier (
    id_article_panier INT AUTO_INCREMENT NOT NULL, 
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
    id_commande                         INT AUTO_INCREMENT NOT NULL,
    date_commande                       DATE NOT NULL,
    montant_total                       DECIMAL(10,2) NOT NULL,
    utilisateur_identifiant_utilisateur VARCHAR(10) NOT NULL,
    adresse_id_adresse                  INT NOT NULL,
    PRIMARY KEY (id_commande) 
);

CREATE TABLE emprunt (
    id_emprunt                          INT AUTO_INCREMENT NOT NULL,
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
    id_evaluation           INT AUTO_INCREMENT NOT NULL, 
    note                    INT NOT NULL,
    commentaire             VARCHAR(200),
    date_note               DATE NOT NULL,
    tome_isbn               INT NOT NULL,
    identifiant_utilisateur VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_evaluation) 
);

CREATE TABLE historique (
    id_historique                       INT AUTO_INCREMENT NOT NULL,
    `type`                              VARCHAR(10) NOT NULL,
    utilisateur_identifiant_utilisateur VARCHAR(10) NOT NULL,
    commande_id_commande                INT NOT NULL,
    emprunt_id_emprunt                  INT NOT NULL,
    PRIMARY KEY (id_historique) 
);

CREATE TABLE panier (
    id_panier                           INT AUTO_INCREMENT NOT NULL, 
    date_creation                       DATE NOT NULL,
    u_identifiant_utilisateur           VARCHAR(10) NOT NULL,
    PRIMARY KEY (id_panier) 
);

CREATE TABLE serie (
    id_serie               INT AUTO_INCREMENT NOT NULL,
    image_serie            VARCHAR(255) NOT NULL,
    titre_serie            VARCHAR(20) NOT NULL,
    auteur                 VARCHAR(20) NOT NULL,
    editeur                VARCHAR(20) NOT NULL,
    synopsis               VARCHAR(2000) NOT NULL,
    aguicheur              VARCHAR(255) NOT NULL,
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

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Jujutsu Kaisen', 
    '/images/imgserie_jjk.png',
    'Gege Akutami', 
    'Shūeisha', 
    'Plus de 10 000 morts et disparus sont recensés chaque année au Japon. Les sentiments négatifs que relâchent les êtres humains sont en cause. Souffrance, regrets, humiliation : leur concentration dans un même endroit engendre des malédictions souvent mortelles... C''est ce que va découvrir Yuji Itadori, lycéen et membre du club d''occultisme. Il ne croit pas aux fantômes, mais il est doté d''une force physique hors norme qui représente un véritable atout pour les missions du groupe... jusqu''à ce que l''une d''elles prenne une mauvaise tournure. La relique qu''ils dénichent, le doigt découpé d''un démon millénaire, attire les monstres ! Sans réfléchir : le jeune homme avale la relique pour briser la malédiction ! Maintenant, il se trouve possédé par Ryômen Sukuna, le célèbre démon à deux visages. Cependant, contre toute attente, Yuji est toujours capable de garder le contrôle de son corps. Mais en dépit de cela, il est condamné à mort par l''organisation des exorcistes... Une décision qui ne pourra être repoussée qu''à une seule condition : trouver tous les doigts de Sukuna afin d''écarter la menace une bonne fois pour toutes !', 
    1,
    'Combattre les malédictions avec Yuji Itadori.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'One Piece', 
    '/images/imgserie_onepiece.webp',
    'Eiichiro Oda', 
    'Shūeisha', 
    'One Piece suit les aventures de Monkey D. Luffy, un jeune pirate dont le corps a acquis les propriétés du caoutchouc après avoir mangé un fruit du démon. Avec son équipage, les Straw Hat Pirates, Luffy explore Grand Line à la recherche du trésor ultime connu sous le nom de "One Piece" afin de devenir le prochain Roi des Pirates.', 
    1,
    'Suivez les aventures de Luffy et son équipage.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Naruto', 
    '/images/imgserie_naruto.jpg',
    'Masashi Kishimoto', 
    'Shūeisha', 
    'Naruto Uzumaki est un jeune ninja du village de Konoha qui rêve de devenir Hokage, le chef de son village. Rejeté par les autres villageois à cause du démon renard à neuf queues scellé en lui, Naruto travaille dur pour gagner le respect et la reconnaissance de ses pairs tout en protégeant son village des menaces extérieures.', 
    1,
    'Découvrez l''histoire de Naruto Uzumaki.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Kagurabachi', 
    '/images/imgserie_kagurabachi.webp',
    'Takeru Hokazono', 
    'Shūeisha', 
    'Kagurabachi est une série qui suit les aventures d''un jeune garçon nommé Chihiro, qui possède une épée magique capable de couper les malédictions. Il voyage à travers un monde rempli de dangers pour venger la mort de son père et protéger les innocents des forces maléfiques.', 
    1,
    'Explorez un monde mystérieux et magique.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Sakamoto Days', 
    '/images/imgserie_sakamoto.png',
    'Yuto Suzuki', 
    'Shūeisha', 
    'Sakamoto Days raconte l''histoire de Taro Sakamoto, un ancien tueur à gages légendaire qui a pris sa retraite pour vivre une vie paisible avec sa famille. Cependant, son passé finit par le rattraper, et il doit utiliser ses compétences pour protéger ses proches tout en essayant de maintenir une vie normale.', 
    1,
    'Suivez les missions de Sakamoto.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Demon Slayer', 
    '/images/imgserie_demonslayer.webp',
    'Koyoharu Gotouge', 
    'Shūeisha', 
    'Demon Slayer suit l''histoire de Tanjiro Kamado, un jeune garçon dont la famille est massacrée par des démons, à l''exception de sa sœur Nezuko, qui est transformée en démon. Tanjiro se lance alors dans une quête pour venger sa famille et trouver un moyen de rendre à Nezuko son humanité.', 
    1,
    'Rejoignez Tanjiro dans sa quête pour sauver sa sœur.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Bleach', 
    '/images/imgserie_bleach.webp',
    'Tite Kubo', 
    'Shūeisha', 
    'Bleach raconte l''histoire d''Ichigo Kurosaki, un adolescent qui acquiert les pouvoirs d''un Shinigami (dieu de la mort) après avoir rencontré Rukia Kuchiki. Avec ses nouveaux pouvoirs, Ichigo doit protéger les vivants des esprits maléfiques appelés Hollows et guider les âmes errantes vers l''au-delà.', 
    1,
    'Plongez dans l''univers des Shinigami.'
);

INSERT INTO serie (titre_serie, image_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Dragon Ball', 
    '/images/imgserie_dragonball.avif',
    'Akira Toriyama', 
    'Shūeisha', 
    'Dragon Ball suit les aventures de Son Goku, un jeune garçon doté d''une force surhumaine, qui part à la recherche des Dragon Balls, des artefacts magiques capables d''exaucer n''importe quel souhait. Au fil de son voyage, Goku affronte de nombreux ennemis et devient l''un des combattants les plus puissants de l''univers.', 
    1,
    'Rejoignez Goku dans sa quête des Dragon Balls.'
);

INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9791032705544, 
    1, 
    '2020-07-21', 
    1, 
    16.00, 
    '/images/imgtome_jjk1.jpg', 
    5
);