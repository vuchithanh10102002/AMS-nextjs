UPDATE `settings` SET `value` = 'san-pham.html' WHERE `name` = 'link_category_product' AND `value` LIKE '%nuochoawb.webpx.com.vn%';
UPDATE `langs` SET `vi` = REPLACE(`vi`, 'https://nuochoawb.webpx.com.vn/', ''), `en` = REPLACE(`en`, 'https://nuochoawb.webpx.com.vn/', '') WHERE `vi` LIKE '%nuochoawb.webpx.com.vn%' OR `en` LIKE '%nuochoawb.webpx.com.vn%';
