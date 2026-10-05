-- PASSWORDEXPIRED back-office email.
--
-- Same reset link as LOSTPASSWORD (/melis-react/reset-password/<hash>), different wording: the
-- user did not ask for anything, the platform tells them their password is no longer valid.
-- The template itself lives in melis-core/config/app.emails.php + the language files; this row
-- only makes the email editable from the back-office "Emails" tool, like LOSTPASSWORD.
-- Re-runnable: nothing happens when the code name is already there.

INSERT INTO `melis_core_bo_emails`
    (`boe_name`, `boe_code_name`, `boe_from_name`, `boe_from_email`, `boe_reply_to`,
     `boe_tag_accepted_list`, `boe_content_layout`, `boe_content_layout_title`,
     `boe_content_layout_logo`, `boe_content_layout_ftr_info`, `boe_last_edit_date`, `boe_last_user_id`)
SELECT 'Password Expired', 'PASSWORDEXPIRED', 'Melis Technology', 'noreply@melistechnology.com',
       'noreply@melistechnology.com', 'USER_LOGIN,URL', 'melis-core/view/layout/layoutEmail.phtml',
       'Melis Technology', NULL,
       'Melis Technology<br>Address: 4 rue du Dahomey, 75011 Paris France<br>Phone: (+33) 972 386 280<br>Mail: contact@melistechnology.com',
       NOW(), 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `melis_core_bo_emails` WHERE `boe_code_name` = 'PASSWORDEXPIRED');

-- English (lang_id 1) and French (lang_id 2) contents, only for the languages installed.
INSERT INTO `melis_core_bo_emails_details` (`boed_email_id`, `boed_lang_id`, `boed_subject`, `boed_html`, `boed_text`)
SELECT e.`boe_id`, l.`lang_id`, 'Your password has expired',
       '<p>Hi [USER_LOGIN],</p><p>Your password has expired and can no longer be used to sign in. Please click this <a title="link" href="[URL]">link</a> to choose a new one.</p>',
       'Hi [USER_LOGIN], your password has expired and can no longer be used to sign in. Please click this [URL] to choose a new one.'
FROM `melis_core_bo_emails` e
JOIN `melis_core_lang` l ON l.`lang_locale` = 'en_EN'
WHERE e.`boe_code_name` = 'PASSWORDEXPIRED'
  AND NOT EXISTS (SELECT 1 FROM `melis_core_bo_emails_details` d
                  WHERE d.`boed_email_id` = e.`boe_id` AND d.`boed_lang_id` = l.`lang_id`);

INSERT INTO `melis_core_bo_emails_details` (`boed_email_id`, `boed_lang_id`, `boed_subject`, `boed_html`, `boed_text`)
SELECT e.`boe_id`, l.`lang_id`, 'Votre mot de passe a expiré',
       '<p>Bonjour [USER_LOGIN],</p><p>Votre mot de passe a expiré et ne permet plus de vous connecter. Veuillez cliquer sur ce <a href="[URL]">lien</a> pour en choisir un nouveau.</p>',
       'Bonjour [USER_LOGIN], votre mot de passe a expiré et ne permet plus de vous connecter. Veuillez cliquer sur ce [URL] pour en choisir un nouveau.'
FROM `melis_core_bo_emails` e
JOIN `melis_core_lang` l ON l.`lang_locale` = 'fr_FR'
WHERE e.`boe_code_name` = 'PASSWORDEXPIRED'
  AND NOT EXISTS (SELECT 1 FROM `melis_core_bo_emails_details` d
                  WHERE d.`boed_email_id` = e.`boe_id` AND d.`boed_lang_id` = l.`lang_id`);
