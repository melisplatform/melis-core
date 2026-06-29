-- Thème du back-office REACT (séparé du legacy melis_core_platform_scheme).
-- Stockage clé/valeur extensible (header logo, header text, login logo, favicon...).
CREATE TABLE IF NOT EXISTS `melis_core_platform_scheme_react` (
  `psreact_id` int(11) NOT NULL AUTO_INCREMENT,
  `psreact_key` varchar(191) NOT NULL,
  `psreact_value` longtext NULL,
  PRIMARY KEY (`psreact_id`),
  UNIQUE KEY `psreact_key` (`psreact_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clés de thème (mono-valeur : images) gérées par l'outil "Platform theme" React.
-- INSERT IGNORE : rejouable sans écraser les valeurs existantes.
INSERT IGNORE INTO `melis_core_platform_scheme_react` (`psreact_key`, `psreact_value`) VALUES
  ('header_logo', NULL),        -- logo haut-gauche du BO (connecté)
  ('login_logo', NULL),         -- logo du panneau gauche du login
  ('login_background', NULL);   -- image de fond du panneau gauche du login

-- Traductions des textes du thème (titre/sous-titre du login) par langue du back-office
-- (psrtrans_lang_id = melis_core_lang.lang_id). Vide/absent = texte i18n par défaut.
CREATE TABLE IF NOT EXISTS `melis_core_platform_scheme_react_trans` (
  `psrtrans_id` int(11) NOT NULL AUTO_INCREMENT,
  `psrtrans_key` varchar(191) NOT NULL,
  `psrtrans_lang_id` int(11) NOT NULL,
  `psrtrans_value` longtext NULL,
  PRIMARY KEY (`psrtrans_id`),
  UNIQUE KEY `psrtrans_key_lang` (`psrtrans_key`, `psrtrans_lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
