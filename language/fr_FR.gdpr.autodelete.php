<?php

return [
    // auto delete heading
    'tr_melis_core_gdpr_autodelete_label_heading' => 'Auto suppression',
    'tr_melis_core_gdpr_autodelete_label_text_modal_link' => 'Cliquez ici pour savoir comment activer l\'envoi automatique',
    // cron activation modal
    'tr_melis_core_gdpr_autodelete_label_modal_tab_heading' => 'Activation du CRON',
    'tr_melis_core_gdpr_autodelete_label_modal_tab_text' => 'Pour activer le système automatique, un administrateur système doit activer cette ligne en tant que CRON sur le serveur, s\'activant une fois par jour tous les jours(ici à 1h00 dans cet exemple):',
    'tr_melis_core_gdpr_autodelete_label_modal_tab_text2' => 'Ce CRON peut aussi être lancé manuellement simplement en appelant cette URL.',
    // list auto delete configuration
    'tr_melis_core_gdpr_autodelete_label_list_config_heading' => 'Liste des configurations d\'auto suppression',
    'tr_melis_core_gdpr_autodelete_label_list_config_sub_heading' => 'Gérez ici vos configurations d\'auto suppression',
    'tr_melis_core_gdpr_autodelete_label_add_accordion_heading' => 'Ajouter une configuration',
    'tr_melis_core_gdpr_autodelete_label_add_accordion_sub_heading' => 'Choisissez votre site et module pour ajouter une configuration',
    'tr_melis_core_gdpr_autodelete_label_edit_accordion_heading' => 'Editer une configuration',
    'tr_melis_core_gdpr_autodelete_label_edit_accordion_sub_heading' => 'Choisissez votre site et module pour éditer sa configuration',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_1' => 'Alerte 1',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_2' => 'Alerte 2',
    'tr_melis_core_gdpr_autodelete_label_table_col_delete_heading' => 'Anonymisation',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_2_activated' => 'Activé',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_2_deactivated' => 'Désactivé',
    'tr_melis_core_gdpr_autodelete_label_table_filter_empty' => 'Sélectionner',
    // interaces logs area
    'tr_melis_core_gdpr_autodelete_email_logs_show_details_btn' => 'Afficher les détails',
    // form filters translations
    'tr_melis_core_gdpr_autodelete_choose_module' => 'Veuillez choisir un module',
    'tr_melis_core_gdpr_autodelete_choose_site' => 'Veuillez choisir un site',
    'tr_melis_core_gdpr_autodelete_invalid_email' => 'Adresse email invalide',
    'tr_meliscore_gdpr_auto_delete_not_int' => 'La valeur doit être un nombre entier',
    // cron config translations
    'tr_melis_core_gdpr_autodelete_label_days_text' => 'Jour(s)',
    'tr_melis_core_gdpr_autodelete_label_cron_config_title' => 'Configuration du Cron',
    'tr_melis_core_gdpr_autodelete_label_warning_delete' => 'Attention, si le compte ne contient pas d\'email, il sera automatiquement anonymisé car nous ne pouvons pas envoyer d\'email de consentement.',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_status' => 'Activer l\'alerte email',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_status tooltip' => 'Active ou désactive l\'email d\'alerte',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days' => 'Email d\'alerte envoyé après une inactivité de :',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days tooltip' => 'Saisir le nombre de jours d\'inactivité de l\'utilisateur pour l\'envoi de l\'email d\'alerte',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend' => 'Renvoyer l\'alerte 7 jours avant la date limite :',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend tooltip' => 'Envoi un email d\'alerte 7 jours avant la date limite',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days' => 'Le compte sera anonymisé automatiquement après une inactivité de :',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days tooltip' => 'Saisissez le nombre de jours d\'inactivité de l\'utilisateur après lequel le compte est automatiquement supprimé',
    'tr_melis_core_gdpr_autodelete_label_list_config_heading_add_new_config' => 'Ajouter une configuration',

    // email setup form translations
    'tr_melis_core_gdpr_autodelete_label_email_setup_title' => 'Configuration de l\'email',
    'tr_melis_core_gdpr_autodelete_label_email_setup_tags' => 'Tags de remplacement disponibles',

    // alert emails translations
    'tr_melis_core_gdpr_autodelete_label_alert_email_heading' => 'Email d\'alerte',
    'tr_melis_core_gdpr_autodelete_label_alert_email_heading2' => 'Email d\'anonymisation',
    'tr_melis_core_gdpr_autodelete_label_alert_email_tags' => 'Tags de remplacement disponibles',
    'tr_melis_core_gdpr_autodelete_label_alert_email_validation_page' => 'Page de validation',
    'tr_melis_core_gdpr_autodelete_label_delete_everything' => 'Tout supprimer',

    // form erros
    'tr_smtp_form_mgdpr_smtp_host' => 'Hôte',
    'tr_smtp_form_mgdpr_smtp_username' => 'Nom d\'utilisateur',
    'tr_smtp_form_mgdpr_smtp_password' => 'Mot de passe',
    'tr_smtp_form_mgdpr_smtp_confirm_password' => 'Confirmez le mot de passe',
    'tr_smtp_form_mgdpr_smtp_host tooltip' => 'Hôte du serveur',
    'tr_smtp_form_mgdpr_smtp_username tooltip' => 'Nom d\'utilisateur',
    'tr_smtp_form_mgdpr_smtp_password tooltip' => 'Mot de passe',
    'tr_smtp_form_mgdpr_smtp_confirm_password tooltip' => 'Confirmation du mot de passe',
    'tr_smtp_form_mgdpr_smtp_delete_smtp_config_btn' => 'Supprimer la configuration',

    // confirm delete
    'tr_melis_core_gdpr_autodelete_config_delete_title' => 'Supprimer la configuration',
    'tr_melis_core_gdpr_autodelete_config_delete_message' => 'Etes-vous sûr(e) de vouloir supprimer cette configuration ?',
    // log table columns
    'tr_melis_core_gdpr_autodelete_log_table_col_id' => 'Id',
    'tr_melis_core_gdpr_autodelete_log_table_col_log_date' => 'Date',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning1_ok' => 'A1 OK',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning1_ko' => 'A1 KO',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning2_ok' => 'A2 OK',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning2_ko' => 'A2 KO',
    'tr_melis_core_gdpr_autodelete_log_table_col_delete_ok' => 'ANO OK',
    'tr_melis_core_gdpr_autodelete_log_table_col_delete_ko' => 'ANO KO',
    // logs messages
    'tr_melis_core_gdpr_autodelete_config_title' => 'Auto suppression RGPD',
    'tr_melis_core_gdpr_autodelete_config_save_ko' => 'Impossible de sauvegarder La configuration de l\'auto suppression RGPD',
    'tr_melis_core_gdpr_autodelete_config_save_ok' => 'Configuration RGPD ajoutée avec succès',
    'tr_melis_core_gdpr_autodelete_config_update_ok' => 'Configuration RGPD éditée avec succès',
    'tr_melis_core_gdpr_autodelete_config_delete_ok' => 'Configuration RGPD supprimée avec succès',
    // log details
    'tr_melis_core_gdpr_autodelete_log_details_log_date' => 'Date du log',
    'tr_melis_core_gdpr_autodelete_log_details_heading' => 'Détails des logs',
    'tr_melis_core_gdpr_autodelete_log_details_first_warning_heading' => 'Premier email d\'alerte',
    'tr_melis_core_gdpr_autodelete_log_details_second_warning_heading' => 'Deuxième email d\'alerte',
    'tr_melis_core_gdpr_autodelete_log_details_delete_alert_heading' => 'Anonymisation',
    'tr_melis_core_gdpr_auto_delete_site' => 'Site',
    'tr_melis_core_gdpr_auto_delete_site tooltip' => 'Sélectionnez le site',
    'tr_melis_core_gdpr_auto_delete_module' => 'Module',
    'tr_melis_core_gdpr_auto_delete_module tooltip' => 'Sélectionnez le module',
    'tr_melis_core_gdpr_autodelete_label_alert_email_tags tooltip' => 'Liste des tags disponibles pouvant être utilisés dans l\'email',
    'tr_melis_core_gdpr_autodelete_label_alert_email_link' => 'Page de validation',
    'tr_melis_core_gdpr_autodelete_label_alert_email_link tooltip' => 'Saisissez l\'identifiant de la page sur laquelle l\'utilisateur sera redirigé pour valider le statut',
    'tr_melis_core_gdpr_autodelete_log_empty_data' => 'Aucun log',
    'tr_melis_core_gdpr_autodelete_log_no_email' => 'Email non disponible',

    // error messages 
    'tr_melis_core_gdpr_auto_delete_config_anonymization_days_lower' => 'L\'anonymization doit être située après les alertes',
    'tr_melis_core_gdpr_auto_delete_config_second_alert_below' => 'Il devrait y avoir au moins 7 jours entre la 1ère alerte et l\'anonymisation'
];
