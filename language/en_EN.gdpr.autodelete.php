<?php

return [
    // auto delete heading
    'tr_melis_core_gdpr_autodelete_label_heading' => 'Auto delete',
    'tr_melis_core_gdpr_autodelete_label_text_modal_link' => 'Click here to get information on how to activate automatic sending',
    // cron activation modal
    'tr_melis_core_gdpr_autodelete_label_modal_tab_heading' => 'CRON Activation',
    'tr_melis_core_gdpr_autodelete_label_modal_tab_text' => 'In order to activate the automatic system, an admin system must activate this line as a CRON on the server, running once a day everyday (here at 1am everyday in this example):',
    'tr_melis_core_gdpr_autodelete_label_modal_tab_text2' => 'This CRON can also be launched manually by simply calling this URL.',
    // list auto delete configuration
    'tr_melis_core_gdpr_autodelete_label_list_config_heading' => 'List of auto delete configuration',
    'tr_melis_core_gdpr_autodelete_label_list_config_sub_heading' => 'Manage here your auto delete configurations',
    'tr_melis_core_gdpr_autodelete_label_add_accordion_heading' => 'Add configuration',
    'tr_melis_core_gdpr_autodelete_label_edit_accordion_heading' => 'Edit configuration',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_1' => 'Alert 1',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_2' => 'Alert 2',
    'tr_melis_core_gdpr_autodelete_label_table_col_delete_heading' => 'Delete',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_2_activated' => 'Activated',
    'tr_melis_core_gdpr_autodelete_label_table_col_alert_2_deactivated' => 'Deactivated',
    'tr_melis_core_gdpr_autodelete_label_table_filter_empty' => 'Choose',
    // interaces logs area
    'tr_melis_core_gdpr_autodelete_email_logs_show_details_btn' => 'Show details',
    // form filters translations
    'tr_melis_core_gdpr_autodelete_choose_module' => 'Please choose a module',
    'tr_melis_core_gdpr_autodelete_choose_site' => 'Please choose a site',
    'tr_melis_core_gdpr_autodelete_invalid_email' => 'Invalid email address',
    'tr_meliscore_gdpr_auto_delete_not_int' => 'Value must be an integer',
    // cron config translations
    'tr_melis_core_gdpr_autodelete_label_days_text' => 'Day(s)',
    'tr_melis_core_gdpr_autodelete_label_cron_config_title' => 'Cron config',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_status' => 'Activate alert email',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_status tooltip' => 'Activate or not the alert email',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days' => 'Alert email sent after inactivity of:',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days tooltip' => 'Type in the numbers of days of inactivity of a user to send the alert email',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend' => 'Resend alert 7 days before deadline:',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend tooltip' => 'Sends an alert email 7 days before the deadline',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days' => 'Account will be deleted automatically after an inactivity of:',
    'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days tooltip' => 'Type in the numbers of days of inactivity of a user after which the account is automatically deleted',
    'tr_melis_core_gdpr_autodelete_label_list_config_heading_add_new_config' => 'Add new config',
    // email setup form translations
    'tr_melis_core_gdpr_autodelete_label_email_setup_title' => 'Email Setup',
    'tr_melis_core_gdpr_autodelete_label_email_setup_tags' => 'Replacement tags available',
    'tr_melis_core_gdpr_autodelete_label_email_setup_layout' => 'Layout',
    'tr_melis_core_gdpr_autodelete_label_email_setup_layout tooltip' => 'Layout to be used in sending the mail. File must has .phtml extension.',
    'tr_melis_core_gdpr_autodelete_label_email_setup_layout_title' => 'Layout title',
    'tr_melis_core_gdpr_autodelete_label_email_setup_title tooltip' => 'Title of the email layout',
    'tr_melis_core_gdpr_autodelete_label_email_setup_logo' => 'Logo',
    'tr_melis_core_gdpr_autodelete_label_email_setup_logo tooltip' => 'Logo of the email',
    'tr_melis_core_gdpr_autodelete_label_email_setup_layout_desc' => 'Layout information',
    'tr_melis_core_gdpr_autodelete_label_email_setup_layout_desc tooltip' => 'Content of the email, When using tags place it inside [ ], ex [LINK]',
    // alert emails translations
    'tr_melis_core_gdpr_autodelete_label_alert_email_heading' => 'Alert Email',
    'tr_melis_core_gdpr_autodelete_label_alert_email_heading2' => 'Account Deleted Email', 
    'tr_melis_core_gdpr_autodelete_label_alert_email_tags' => 'Replacement tags available',
    'tr_melis_core_gdpr_autodelete_label_alert_email_validation_page' => 'User will validate status on page',
    'tr_melis_core_gdpr_autodelete_label_delete_everything' => 'Delete everything',
    // form erros
    'tr_smtp_form_mgdpr_smtp_host' => 'Host',
    'tr_smtp_form_mgdpr_smtp_host tooltip' => 'Host of the server',
    'tr_smtp_form_mgdpr_smtp_username' => 'Username',
    'tr_smtp_form_mgdpr_smtp_username tooltip' => 'Username of the user',
    'tr_smtp_form_mgdpr_smtp_password' => 'Password',
    'tr_smtp_form_mgdpr_smtp_password tooltip' => 'Password of the user',
    'tr_smtp_form_mgdpr_smtp_confirm_password' => 'Confirm password',
    'tr_smtp_form_mgdpr_smtp_confirm_password tooltip' => 'Confirm password of the user',
    'tr_smtp_form_mgdpr_smtp_delete_smtp_config_btn' => 'Delete smtp config',
    // confirm delete
    'tr_melis_core_gdpr_autodelete_config_delete_title' => 'Delete configuration',
    'tr_melis_core_gdpr_autodelete_config_delete_message' => 'Are you sure you want to delete this configuration?',
    // for log table columns
    'tr_melis_core_gdpr_autodelete_log_table_col_id' => 'Id',
    'tr_melis_core_gdpr_autodelete_log_table_col_log_date' => 'Date',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning1_ok' => 'A1 OK',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning1_ko' => 'A1 KO',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning2_ok' => 'A2 OK',
    'tr_melis_core_gdpr_autodelete_log_table_col_warning2_ko' => 'A2 KO',
    'tr_melis_core_gdpr_autodelete_log_table_col_delete_ok' => 'DEL OK',
    'tr_melis_core_gdpr_autodelete_log_table_col_delete_ko' => 'DEL KO',

    // logs messages
    'tr_melis_core_gdpr_autodelete_config_title' => 'GDPR auto delete',
    'tr_melis_core_gdpr_autodelete_config_save_ko' => 'Unable to save gdpr auto delete config',
    'tr_melis_core_gdpr_autodelete_config_save_ok' => 'Successfully saved gdpr auto delete config',
    'tr_melis_core_gdpr_autodelete_config_update_ok' => 'Successfully updated gdpr auto delete config',
    'tr_melis_core_gdpr_autodelete_config_delete_ok' => 'Successfully deleted gdpr auto delete config',
    // log details
    'tr_melis_core_gdpr_autodelete_log_details_heading' => 'Log details',
    'tr_melis_core_gdpr_autodelete_log_details_first_warning_heading' => 'First alert warning email',
    'tr_melis_core_gdpr_autodelete_log_details_second_warning_heading' => 'Second alert warning email',
    'tr_melis_core_gdpr_autodelete_log_details_delete_alert_heading' => 'Delete alert email',
    'tr_melis_core_gdpr_auto_delete_site' => 'Site',
    'tr_melis_core_gdpr_auto_delete_site tooltip' => 'Select the site',
    'tr_melis_core_gdpr_auto_delete_module' => 'Module',
    'tr_melis_core_gdpr_auto_delete_module tooltip' => 'Select the module',
    'tr_melis_core_gdpr_autodelete_label_alert_email_tags tooltip' => 'List of available tags that can be used in the email',
    'tr_melis_core_gdpr_autodelete_label_alert_email_link' => 'Validation page',
    'tr_melis_core_gdpr_autodelete_label_alert_email_link tooltip' => 'Type in the page ID on which the user will be redirected to validate the status',
    'tr_melis_core_gdpr_autodelete_log_empty_data' => 'No logs data yet',



];
