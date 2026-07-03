-- Cache de droits PRÉCALCULÉ par utilisateur — accélère le menu / canAccess() / capacités.
-- Résolu à la sauvegarde (user + rôle) puis lu partout via MelisCoreRights::getResolvedRights().
--   usr_rights_cache     : JSON { "allow": { "<melisKey>": 1, ... }, "caps": { "<toolKey>": [...] } }
--   usr_rights_cache_sig : signature md5(usr_rights) + version de la config d'interface ;
--                          toute divergence déclenche une reconstruction paresseuse (auto-invalidation).
ALTER TABLE `melis_core_user`
  ADD `usr_rights_cache` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL AFTER `usr_rights`,
  ADD `usr_rights_cache_sig` VARCHAR(64) NULL DEFAULT NULL AFTER `usr_rights_cache`;
