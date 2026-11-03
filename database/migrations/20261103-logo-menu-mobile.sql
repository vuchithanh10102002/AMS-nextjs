INSERT IGNORE INTO langs (`key`, vi, en, pos)
SELECT 'logo_menu_mobile', vi, en, pos FROM langs WHERE `key` = 'logo_mobile';
