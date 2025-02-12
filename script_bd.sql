-- Généré par Oracle SQL Developer Data Modeler 23.1.0.087.0806
--   à :        2025-02-12 10:23:36 HNE
--   site :      Oracle Database 21c
--   type :      Oracle Database 21c



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE adresse (
    id_adresse                          NUMBER NOT NULL,
    rue                                 VARCHAR2(20) NOT NULL,
    numero_adresse                      NUMBER NOT NULL,
    code_postal                         VARCHAR2(7) NOT NULL,
    ville                               VARCHAR2(20) NOT NULL,
    pays                                VARCHAR2(20) NOT NULL,
    province                            VARCHAR2(20) NOT NULL, 
--  ERROR: Column name length exceeds maximum allowed length(30) 
    utilisateur_identifiant_utilisateur VARCHAR2(10) NOT NULL
);

ALTER TABLE adresse ADD CONSTRAINT adresse_pk PRIMARY KEY ( id_adresse );

CREATE TABLE article_commande (
    id_article           NUMBER NOT NULL,
    quantite             NUMBER NOT NULL,
    commande_id_commande NUMBER NOT NULL,
    tome_isbn            NUMBER NOT NULL
);

ALTER TABLE article_commande ADD CONSTRAINT article_commande_pk PRIMARY KEY ( id_article );

CREATE TABLE article_panier (
    id_article_panier NUMBER NOT NULL,
    tome_isbn         NUMBER NOT NULL,
    panier_id_panier  NUMBER NOT NULL,
    quantite          NUMBER
);

ALTER TABLE article_panier ADD CONSTRAINT article_panier_pk PRIMARY KEY ( id_article_panier );

CREATE TABLE categorie (
    id_categorie  NUMBER NOT NULL,
    nom_categorie VARCHAR2(20) NOT NULL,
    description   VARCHAR2(100) NOT NULL
);

ALTER TABLE categorie ADD CONSTRAINT categorie_pk PRIMARY KEY ( id_categorie );

CREATE TABLE commande (
    id_commande                         NUMBER NOT NULL,
    date_commande                       DATE NOT NULL,
    montant_total                       NUMBER NOT NULL, 
--  ERROR: Column name length exceeds maximum allowed length(30) 
    utilisateur_identifiant_utilisateur VARCHAR2(10) NOT NULL,
    adresse_id_adresse                  NUMBER NOT NULL
);

ALTER TABLE commande ADD CONSTRAINT commande_pk PRIMARY KEY ( id_commande );

CREATE TABLE emprunt (
    id_emprunt                          NUMBER NOT NULL,
    date_emprunt                        DATE NOT NULL,
    date_retour                         DATE NOT NULL,
    statut                              VARCHAR2 
--  ERROR: VARCHAR2 size not specified 
     NOT NULL, 
--  ERROR: Column name length exceeds maximum allowed length(30) 
    utilisateur_identifiant_utilisateur VARCHAR2(10) NOT NULL,
    tome_isbn                           NUMBER NOT NULL,
    adresse_id_adresse                  NUMBER,
    date_retournee                      DATE
);

ALTER TABLE emprunt ADD CONSTRAINT emprunt_pk PRIMARY KEY ( id_emprunt );

CREATE TABLE evaluation (
    id_evaluation           NUMBER NOT NULL,
    note                    NUMBER NOT NULL,
    commentaire             VARCHAR2(200),
    date_note               DATE NOT NULL,
    tome_isbn               NUMBER NOT NULL,
    identifiant_utilisateur VARCHAR2(20) NOT NULL
);

ALTER TABLE evaluation ADD CONSTRAINT evaluation_pk PRIMARY KEY ( id_evaluation );

CREATE TABLE historique (
    id_historique                       NUMBER NOT NULL,
    type                                VARCHAR2(10) NOT NULL, 
--  ERROR: Column name length exceeds maximum allowed length(30) 
    utilisateur_identifiant_utilisateur VARCHAR2(10) NOT NULL,
    commande_id_commande                NUMBER NOT NULL,
    emprunt_id_emprunt                  NUMBER NOT NULL
);

ALTER TABLE historique ADD CONSTRAINT historique_pk PRIMARY KEY ( id_historique );

CREATE TABLE panier (
    id_panier                           UNIQUE NUMBER NOT NULL,
    date_creation                       DATE NOT NULL, 
    u_identifiant_utilisateur VARCHAR2(10) NOT NULL
);

CREATE UNIQUE INDEX panier__idx ON
    panier (
        utilisateur_identifiant_utilisateur
    ASC );

ALTER TABLE panier ADD CONSTRAINT panier_pk PRIMARY KEY ( id_panier );

CREATE TABLE serie (
    id_serie               NUMBER UNIQUE NOT NULL,
    titre_serie            VARCHAR2(20) NOT NULL,
    auteur                 VARCHAR2(20) NOT NULL,
    editeur                VARCHAR2(20) NOT NULL,
    synopsis               VARCHAR2(1000) NOT NULL,
    categorie_id_categorie NUMBER NOT NULL
);

ALTER TABLE serie ADD CONSTRAINT serie_pk PRIMARY KEY ( id_serie );

CREATE TABLE tome (
    isbn              NUMBER UNIQUE NOT NULL,
    numero_volume     NUMBER NOT NULL,
    annee_publication DATE NOT NULL,
    serie_id_serie    NUMBER NOT NULL,
    prix              NUMBER NOT NULL,
    image             BLOB NOT NULL,
    stock             NUMBER NOT NULL
);

ALTER TABLE tome ADD CONSTRAINT tome_pk PRIMARY KEY ( isbn );

CREATE TABLE utilisateur (
    identifiant_utilisateur VARCHAR2(10) UNIQUE NOT NULL,
    nom                     VARCHAR2(10) NOT NULL,
    prenom                  VARCHAR2(10) NOT NULL,
    mot_de_passe            VARCHAR2(20) NOT NULL,
    adresse_electronique   VARCHAR2(25) UNIQUE NOT NULL,
    telephone ()
);

ALTER TABLE utilisateur ADD CONSTRAINT utilisateur_pk PRIMARY KEY ( identifiant_utilisateur );

ALTER TABLE adresse
    ADD CONSTRAINT adresse_utilisateur_fk FOREIGN KEY ( u_identifiant_utilisateur )
        REFERENCES utilisateur ( identifiant_utilisateur );

ALTER TABLE article_commande
    ADD CONSTRAINT article_commande_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );

ALTER TABLE article_commande
    ADD CONSTRAINT article_commande_tome_fk FOREIGN KEY ( tome_isbn )
        REFERENCES tome ( isbn );

ALTER TABLE article_panier
    ADD CONSTRAINT article_panier_panier_fk FOREIGN KEY ( panier_id_panier )
        REFERENCES panier ( id_panier );

ALTER TABLE article_panier
    ADD CONSTRAINT article_panier_tome_fk FOREIGN KEY ( tome_isbn )
        REFERENCES tome ( isbn );

ALTER TABLE commande
    ADD CONSTRAINT commande_adresse_fk FOREIGN KEY ( adresse_id_adresse )
        REFERENCES adresse ( id_adresse );

ALTER TABLE commande
    ADD CONSTRAINT commande_utilisateur_fk FOREIGN KEY ( u_identifiant_utilisateur )
        REFERENCES utilisateur ( identifiant_utilisateur );

ALTER TABLE emprunt
    ADD CONSTRAINT emprunt_adresse_fk FOREIGN KEY ( adresse_id_adresse )
        REFERENCES adresse ( id_adresse );

ALTER TABLE emprunt
    ADD CONSTRAINT emprunt_tome_fk FOREIGN KEY ( tome_isbn )
        REFERENCES tome ( isbn );

ALTER TABLE emprunt
    ADD CONSTRAINT emprunt_utilisateur_fk FOREIGN KEY ( u_identifiant_utilisateur )
        REFERENCES utilisateur ( identifiant_utilisateur );

ALTER TABLE evaluation
    ADD CONSTRAINT evaluation_tome_fk FOREIGN KEY ( tome_isbn )
        REFERENCES tome ( isbn );

ALTER TABLE evaluation
    ADD CONSTRAINT evaluation_utilisateur_fk FOREIGN KEY ( identifiant_utilisateur )
        REFERENCES utilisateur ( identifiant_utilisateur );

ALTER TABLE historique
    ADD CONSTRAINT historique_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );

ALTER TABLE historique
    ADD CONSTRAINT historique_emprunt_fk FOREIGN KEY ( emprunt_id_emprunt )
        REFERENCES emprunt ( id_emprunt );

ALTER TABLE historique
    ADD CONSTRAINT historique_utilisateur_fk FOREIGN KEY ( u_identifiant_utilisateur )
        REFERENCES utilisateur ( identifiant_utilisateur );

ALTER TABLE panier
    ADD CONSTRAINT panier_utilisateur_fk FOREIGN KEY ( u_identifiant_utilisateur )
        REFERENCES utilisateur ( identifiant_utilisateur );

ALTER TABLE serie
    ADD CONSTRAINT serie_categorie_fk FOREIGN KEY ( categorie_id_categorie )
        REFERENCES categorie ( id_categorie );

ALTER TABLE tome
    ADD CONSTRAINT tome_serie_fk FOREIGN KEY ( serie_id_serie )
        REFERENCES serie ( id_serie );



-- Rapport récapitulatif d'Oracle SQL Developer Data Modeler : 
-- 
-- CREATE TABLE                            12
-- CREATE INDEX                             1
-- ALTER TABLE                             30
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   6
-- WARNINGS                                 0
