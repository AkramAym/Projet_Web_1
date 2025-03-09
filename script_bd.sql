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
    utilisateur_identifiant VARCHAR(10) NOT NULL,
    PRIMARY KEY (id_adresse) 
);

CREATE TABLE article_commande (
    id_article           INT AUTO_INCREMENT NOT NULL, 
    quantite             INT NOT NULL,
    commande_id_commande INT NOT NULL,
    tome_isbn            DECIMAL(13) NOT NULL, 
    PRIMARY KEY (id_article)
);

CREATE TABLE article_panier (
    id_article_panier INT AUTO_INCREMENT NOT NULL, 
    tome_isbn         DECIMAL(13) NOT NULL, 
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
    utilisateur_identifiant VARCHAR(10) NOT NULL,
    adresse_id_adresse                  INT NOT NULL,
    PRIMARY KEY (id_commande) 
);

CREATE TABLE emprunt (
    id_emprunt                          INT AUTO_INCREMENT NOT NULL,
    date_emprunt                        DATE NOT NULL,
    date_retour                         DATE NOT NULL,
    statut                              VARCHAR(20) NOT NULL,
    utilisateur_identifiant VARCHAR(10) NOT NULL,
    tome_isbn                           DECIMAL(13) NOT NULL, 
    adresse_id_adresse                  INT,
    date_retournee                      DATE,
    PRIMARY KEY (id_emprunt) 
);

CREATE TABLE evaluation (
    id_evaluation           INT AUTO_INCREMENT NOT NULL, 
    note                    INT NOT NULL,
    commentaire             VARCHAR(200),
    date_note               DATE NOT NULL,
    tome_isbn               DECIMAL(13) NOT NULL, 
    identifiant VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_evaluation) 
);

CREATE TABLE historique (
    id_historique                       INT AUTO_INCREMENT NOT NULL,
    `type`                              VARCHAR(10) NOT NULL,
    utilisateur_identifiant VARCHAR(10) NOT NULL,
    commande_id_commande                INT NOT NULL,
    emprunt_id_emprunt                  INT NOT NULL,
    PRIMARY KEY (id_historique) 
);

CREATE TABLE panier (
    id_panier                           INT AUTO_INCREMENT NOT NULL, 
    date_creation                       DATE NOT NULL,
    utilisateur_identifiant           VARCHAR(10) NOT NULL,
    PRIMARY KEY (id_panier) 
);

CREATE TABLE serie (
    id_serie               INT AUTO_INCREMENT NOT NULL,
    image_serie            VARCHAR(255) NOT NULL,
    imageLong_serie            VARCHAR(255) NOT NULL,
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
    identifiant VARCHAR(10) NOT NULL, 
    nom                     VARCHAR(10) NOT NULL,
    prenom                  VARCHAR(10) NOT NULL,
    mot_de_passe            VARCHAR(200) NOT NULL,
    email    VARCHAR(25) NOT NULL,
    telephone               VARCHAR(15),
    solde              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (identifiant) 
);


ALTER TABLE adresse
    ADD CONSTRAINT adresse_utilisateur_fk 
    FOREIGN KEY (utilisateur_identifiant) 
    REFERENCES utilisateur(identifiant);

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
    FOREIGN KEY (utilisateur_identifiant) 
    REFERENCES utilisateur(identifiant);

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
    FOREIGN KEY (utilisateur_identifiant) 
    REFERENCES utilisateur(identifiant);

ALTER TABLE evaluation
    ADD CONSTRAINT evaluation_tome_fk 
    FOREIGN KEY (tome_isbn) 
    REFERENCES tome(isbn);

ALTER TABLE evaluation
    ADD CONSTRAINT evaluation_utilisateur_fk 
    FOREIGN KEY (identifiant) 
    REFERENCES utilisateur(identifiant);

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
    FOREIGN KEY (utilisateur_identifiant) 
    REFERENCES utilisateur(identifiant);

ALTER TABLE panier
    ADD CONSTRAINT panier_utilisateur_fk 
    FOREIGN KEY (utilisateur_identifiant) 
    REFERENCES utilisateur(identifiant);

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
    ('Shonen', 'Le Shonen est un genre de manga principalement destiné à un public jeune masculin. Il se caractérise par des histoires dynamiques, souvent axées sur l''action, l''aventure, l''amitié et la persévérance. Exemples populaires : "Naruto", "Dragon Ball", "One Piece".'),
    ('Seinen', 'Le Seinen est un genre de manga ciblant un public adulte masculin. Les thèmes abordés sont souvent plus matures et complexes, incluant la psychologie, la politique, la violence ou la science-fiction. Exemples populaires : "Berserk", "Tokyo Ghoul", "Ghost in the Shell".'),
    ('Shojo', 'Le Shojo est un genre de manga destiné à un public jeune féminin. Il met souvent l''accent sur les relations interpersonnelles, les romances, les drames et les émotions. Le style artistique est généralement plus raffiné et expressif. Exemples populaires : "Fruits Basket", "Nana", "Sailor Moon".');

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Jujutsu Kaisen', 
    '/images/imgserie_jjk.png',
    '/images/imgLongSerie_jjk.avif',
    'Gege Akutami', 
    'Shūeisha', 
    'Plus de 10 000 morts et disparus sont recensés chaque année au Japon. Les sentiments négatifs que relâchent les êtres humains sont en cause. Souffrance, regrets, humiliation : leur concentration dans un même endroit engendre des malédictions souvent mortelles... C''est ce que va découvrir Yuji Itadori, lycéen et membre du club d''occultisme. Il ne croit pas aux fantômes, mais il est doté d''une force physique hors norme qui représente un véritable atout pour les missions du groupe... jusqu''à ce que l''une d''elles prenne une mauvaise tournure. La relique qu''ils dénichent, le doigt découpé d''un démon millénaire, attire les monstres ! Sans réfléchir : le jeune homme avale la relique pour briser la malédiction ! Maintenant, il se trouve possédé par Ryômen Sukuna, le célèbre démon à deux visages. Cependant, contre toute attente, Yuji est toujours capable de garder le contrôle de son corps. Mais en dépit de cela, il est condamné à mort par l''organisation des exorcistes... Une décision qui ne pourra être repoussée qu''à une seule condition : trouver tous les doigts de Sukuna afin d''écarter la menace une bonne fois pour toutes !', 
    1,
    'Combattre les malédictions avec Yuji Itadori.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'One Piece', 
    '/images/imgserie_onepiece.webp',
    '/images/imgLongSerie_onepiece.jpg',
    'Eiichiro Oda', 
    'Shūeisha', 
    'One Piece suit les aventures de Monkey D. Luffy, un jeune pirate dont le corps a acquis les propriétés du caoutchouc après avoir mangé un fruit du démon. Avec son équipage, les Straw Hat Pirates, Luffy explore Grand Line à la recherche du trésor ultime connu sous le nom de "One Piece" afin de devenir le prochain Roi des Pirates.', 
    1,
    'Suivez les aventures de Luffy et son équipage.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Naruto', 
    '/images/imgserie_naruto.jpg',
    '/images/imgLongSerie_naruto.jpg',
    'Masashi Kishimoto', 
    'Shūeisha', 
    'Naruto Uzumaki est un jeune ninja du village de Konoha qui rêve de devenir Hokage, le chef de son village. Rejeté par les autres villageois à cause du démon renard à neuf queues scellé en lui, Naruto travaille dur pour gagner le respect et la reconnaissance de ses pairs tout en protégeant son village des menaces extérieures.', 
    1,
    'Découvrez l''histoire de Naruto Uzumaki.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Ascension', 
    '/images/imgserie_ascencion.webp',
    '/images/imgLongserie_ascencion.png',
    'Shin''ichi Sakamoto', 
    'Shūeisha', 
    'Buntaro Mori, jeune lycéen solitaire et renfermé, est défié par un camarade de classe fan d''escalade. Le défi ? Escalader le lycée. C''est alors que, en grimpant le long d''une gouttière bien placée, Buntaro se découvre une passion et un don. Après avoir escaladé sans trop de mal le lycée, ce dernier est tout de suite repéré par son professeur d''anglais, lui-même fan de grimpe extrême. Grâce à l''escalade, Buntaro va se découvrir un but dans la vie, et se perfectionner dans ce domaine, jusqu''à atteindre les cieux.', 
    2,
    'Suivez Buntaro dans son ascencion vers les sommets les plus hauts.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Nana', 
    '/images/imgserie_nana.jpg',
    '/images/imgLongserie_nana.avif',
    'Ai Yazawa', 
    'Shūeisha', 
    'Dans le Japon contemporain, deux jeunes femmes se rencontrent dans le train les conduisant à Tokyo. L''une va rejoindre son petit ami tandis que l''autre veut devenir chanteuse professionnelle. Inconsciemment, cette dernière est également à la poursuite de son petit ami parti faire carrière dans la musique deux ans plus tôt. Leur destination n''est pas leur seul point commun car elles ont le même âge (20 ans), mais aussi le même prénom : Nana. Elles se séparent finalement à la descente du train. Plus tard, elles se retrouvent par hasard, alors qu''elles cherchaient toutes les deux un appartement. Trouvant avantageux de partager les frais de loyer, elles décident de vivre en colocation dans l''appartement 707 (c''est une autre coïncidence car leur prénom, Nana, représente le chiffre 7 en japonais). Aussi différentes d''apparence que de caractère, Nana Ōsaki et Nana Komatsu vont se lier d''une profonde et fusionnelle amitié, se complétant et se soutenant mutuellement à travers les différentes épreuves qu''elles seront amenées à traverser.', 
    3,
    'Découvrez l''histoire de deux femmes liées par le destin et un prénom.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Bleach', 
    '/images/imgserie_bleach.webp',
    '/images/imgLongserie_bleach.jpg',
    'Tite Kubo', 
    'Shūeisha', 
    'Bleach raconte l''histoire d''Ichigo Kurosaki, un adolescent qui acquiert les pouvoirs d''un Shinigami (dieu de la mort) après avoir rencontré Rukia Kuchiki. Avec ses nouveaux pouvoirs, Ichigo doit protéger les vivants des esprits maléfiques appelés Hollows et guider les âmes errantes vers l''au-delà.', 
    1,
    'Plongez dans l''univers des Shinigami.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Dragon Ball', 
    '/images/imgserie_dragonball.avif',
    '/images/imgLongserie_dragonball.jpg',
    'Akira Toriyama', 
    'Shūeisha', 
    'Dragon Ball suit les aventures de Son Goku, un jeune garçon doté d''une force surhumaine, qui part à la recherche des Dragon Balls, des artefacts magiques capables d''exaucer n''importe quel souhait. Au fil de son voyage, Goku affronte de nombreux ennemis et devient l''un des combattants les plus puissants de l''univers.', 
    1,
    'Rejoignez Goku dans sa quête des Dragon Balls.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Kingdom', 
    '/images/imgserie_kingdom.webp', 
    '/images/imgLongserie_kingdom.avif', 
    'Yasuhisa Hara', 
    'Shūeisha', 
    'En pleine période des Royaumes combattants en Chine, Xin, un jeune orphelin, rêve de devenir le plus grand général de l''histoire. Aux côtés de son ami d''enfance, Zheng, qui aspire à unifier la Chine et à devenir roi, Xin se lance dans une quête épique pour réaliser leurs ambitions. À travers des batailles stratégiques, des alliances complexes et des sacrifices personnels, Kingdom explore l''ascension de ces deux héros dans un monde déchiré par la guerre.', 
    2,
    'Plongez dans l''épopée guerrière de la Chine ancienne avec Shin et Sei.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Vagabond', 
    '/images/imgserie_vagabond.jpg', 
    '/images/imgLongserie_vagabond.jpg', 
    'Takehiko Inoue', 
    'Tonkam', 
    'Inspiré de la vie du légendaire samouraï Miyamoto Musashi, Vagabond raconte l''histoire de Takezō Shinmen, un jeune homme violent et ambitieux qui cherche à devenir le plus grand samouraï de tous les temps. Après avoir survécu à la bataille de Sekigahara, Takezō parcourt le Japon, affrontant des adversaires redoutables et cherchant à comprendre le véritable sens de la force et de l''honneur. Ce récit introspectif et visuellement somptueux explore la quête de perfection et la nature humaine.', 
    2, 
    'Suivez le voyage intérieur et extérieur de Miyamoto Musashi, le plus grand samouraï de l''histoire.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Sakamoto Days', 
    '/images/imgserie_sakamoto.png',
    '/images/imgLongserie_sakamoto.jpg',
    'Yuto Suzuki', 
    'Shūeisha', 
    'Sakamoto Days raconte l''histoire de Taro Sakamoto, un ancien tueur à gages légendaire qui a pris sa retraite pour vivre une vie paisible avec sa famille. Cependant, son passé finit par le rattraper, et il doit utiliser ses compétences pour protéger ses proches tout en essayant de maintenir une vie normale.', 
    1,
    'Suivez les missions de Sakamoto.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Demon Slayer', 
    '/images/imgserie_demonslayer.webp',
    '/images/imgLongserie_demonslayer.avif',
    'Koyoharu Gotouge', 
    'Shūeisha', 
    'Demon Slayer suit l''histoire de Tanjiro Kamado, un jeune garçon dont la famille est massacrée par des démons, à l''exception de sa sœur Nezuko, qui est transformée en démon. Tanjiro se lance alors dans une quête pour venger sa famille et trouver un moyen de rendre à Nezuko son humanité.', 
    1,
    'Rejoignez Tanjiro dans sa quête pour sauver sa sœur.'
);

INSERT INTO serie (titre_serie, image_serie, imageLong_serie, auteur, editeur, synopsis, categorie_id_categorie, aguicheur)
VALUES (
    'Kagurabachi', 
    '/images/imgserie_kagurabachi.webp',
    '/images/imgLongserie_kagurabachi.jpg',
    'Takeru Hokazono', 
    'Shūeisha', 
    'Kagurabachi est une série qui suit les aventures d''un jeune garçon nommé Chihiro, qui possède une épée magique capable de couper les malédictions. Il voyage à travers un monde rempli de dangers pour venger la mort de son père et protéger les innocents des forces maléfiques.', 
    1,
    'Explorez un monde mystérieux et magique.'
);


-- Tomes Jujutsu Kaisen 

-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9791032705544, 
    1, 
    '2020-07-21', 
    1, 
    16.00, 
    '/images/imgtome_jjk1.jpg', 
    0
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9791032705537,  
    2, 
    '2020-10-21', 
    1, 
    16.00, 
    '/images/imgtome_jjk2.jpg', 
    5
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9791032706077,  
    3, 
    '2021-01-21', 
    1, 
    16.00, 
    '/images/imgtome_jjk3.jpg', 
    5
);

-- Tomes One Piece

-- Tome 1 
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782723488525,  
    1, 
    '2003-09-02',  
    2,              
    12.95,          
    '/images/imgtome_onepiece1.webp',  
    10              
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782723489898,  
    2, 
    '2003-11-05',  
    2,              
    12.95,          
    '/images/imgtome_onepiece2.webp',  
    10              
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782723489904,  
    3, 
    '2004-01-07',  
    2,              
    12.95,          
    '/images/imgtome_onepiece3.webp',  
    10              
);

-- Tomes Ascencion

-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782756016641,  
    1, 
    '2010-11-11',   
    4,              
    15.00,          
    '/images/imgtome_ascencion1.jpg',  
    8               
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782756020433,  
    2, 
    '2011-02-10',   
    4,              
    15.00,          
    '/images/imgtome_ascencion2.jpg',  
    8               
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782756020440,  
    3, 
    '2011-05-12',   
    4,              
    15.00,          
    '/images/imgtome_ascencion3.jpg',  
    8               
);

-- Tomes DB

-- Tome 1 
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782876952058,  
    1, 
    '1998-12-03',   
    7,             
    14.99,         
    '/images/imgtome_dragonball1.jpg', 
    12            
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782876952065,  
    2, 
    '1999-02-04',   
    7,             
    14.99,         
    '/images/imgtome_dragonball2.jpg', 
    12            
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782876952072,  
    3, 
    '1999-04-01',   
    7,             
    14.99,         
    '/images/imgtome_dragonball3.jpg', 
    12            
);

-- Tomes Naruto

-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782871294146,  
    1, 
    '2002-01-01',   
    3,              
    12.50,          
    '/images/imgtome_naruto1.jpeg',  
    15              
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782871294177,  
    2, 
    '2002-05-15',   
    3,              
    12.50,          
    '/images/imgtome_naruto2.jpg',  
    15              
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782871294276,  
    3, 
    '2002-08-15',   
    3,              
    12.50,          
    '/images/imgtome_naruto3.jpg',  
    15              
);

-- Tomes Bleach

-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782723442275,  
    1, 
    '2003-02-07',   
    6,              
    13.99,          
    '/images/imgtome_bleach1.jpg',  
    7               
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9781591164425,  
    2, 
    '2003-10-24',   
    6,              
    13.99,          
    '/images/imgtome_bleach2.jpg',  
    7               
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9781591164432,  
    3, 
    '2004-01-23',   
    6,              
    13.99,          
    '/images/imgtome_bleach3.jpg',  
    7               
);

-- Tomes Nana

-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782840559573,  
    1, 
    '2002-12-04',   
    5,              
    13.99,          
    '/images/imgtome_nana1.jpg',  
    7               
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782840559641,  
    2, 
    '2003-03-05',   
    5,              
    13.99,          
    '/images/imgtome_nana2.jpg',  
    7               
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782847890259,  
    3, 
    '2003-04-16',   
    5,              
    13.99,          
    '/images/imgtome_nana3.jpg',  
    7               
);

-- Tomes Kingdom 
-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782368778050,  
    1, 
    '2024-08-19',   
    8,              
    14.99,          
    '/images/imgtome_kingdom1.jpg',  
    10              
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782368778067,  
    2, 
    '2024-08-19',   
    8,              
    14.99,          
    '/images/imgtome_kingdom2.jpg',  
    10              
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782368778074,  
    3, 
    '2024-08-19',   
    8,              
    14.99,          
    '/images/imgtome_kingdom3.jpg',  
    10              
);

-- Tomes Vagabond
-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782845800670,  
    1, 
    '2002-10-23',   
    9,              
    15.50,          
    '/images/imgtome_vagabond1.jpg',  
    8               
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782845801158,  
    2, 
    '2002-10-23',   
    9,              
    15.50,          
    '/images/imgtome_vagabond2.jpg',  
    8               
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782845801233,  
    3, 
    '2015-01-08',   
    9,              
    15.50,          
    '/images/imgtome_vagabond3.jpg',  
    8               
);

-- Tomes Sakamoto Days
-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782344050989,  
    1, 
    '2022-06-21',   
    10,              
    12.99,          
    '/images/imgtome_sakamotodays1.jpg',  
    12              
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782344050996,  
    2, 
    '2022-06-21',   
    10,              
    12.99,          
    '/images/imgtome_sakamotodays2.jpg',  
    12              
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782344051009,  
    3, 
    '2022-07-26',   
    10,              
    12.99,          
    '/images/imgtome_sakamotodays3.jpg',  
    12              
);

-- Tomes Demon Slayer
-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782809482317,  
    1, 
    '2020-02-03',   
    11,              
    13.50,          
    '/images/imgtome_demonslayer1.jpg',  
    15              
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782809482324,  
    2, 
    '2020-02-03',   
    11,              
    13.50,          
    '/images/imgtome_demonslayer2.jpg',  
    15              
);

-- Tome 3
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9782809476132,  
    3, 
    '2020-03-09',   
    11,              
    13.50,          
    '/images/imgtome_demonslayer3.jpg',  
    15              
);

-- Tomes Kagurabachi

-- Tome 1
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9781974747245,  
    1, 
    '2024-11-05',   
    12,              
    14.99,          
    '/images/imgtome_kagurabachi1.jpg',  
    10              
);

-- Tome 2
INSERT INTO tome (isbn, numero_volume, annee_publication, serie_id_serie, prix, image, stock)
VALUES (
    9781974752713,  
    2, 
    '2025-02-04',   
    12,              
    14.99,          
    '/images/imgtome_kagurabachi2.jpg',  
    10              
);

INSERT INTO utilisateur (
    identifiant,
    nom,
    prenom,
    mot_de_passe,
    email,
    telephone
) VALUES (
    'okunay',          
    'oku',              
    'nay',             
    '$2b$10$soemKXga3Y8YxCvvQK.JX.wfJCn70RcJL61MA7UvftLpdtqJm.gU2',    
    'ravless21@gmail.com',   
    '5147099684'      
);


INSERT INTO panier (date_creation, utilisateur_identifiant)
VALUES (CURDATE(), 'okunay');

INSERT INTO article_panier (tome_isbn, panier_id_panier, quantite)
VALUES (9782723488525, 1, 1);
