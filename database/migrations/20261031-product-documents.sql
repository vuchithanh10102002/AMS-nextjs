SET NAMES utf8mb4;
INSERT INTO documents (node_id, title, title_en, link, pos)
SELECT p.node_id, l.vi, l.en, '', IF(l.`key` = 'product_text_5', 1, 2)
FROM products p
JOIN nodes n ON n.id = p.node_id AND n.type = 'product'
JOIN langs l ON l.`key` IN ('product_text_5', 'product_text_6')
WHERE NOT EXISTS (SELECT 1 FROM documents d WHERE d.node_id = p.node_id);
