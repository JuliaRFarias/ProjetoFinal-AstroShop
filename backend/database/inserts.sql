
USE `projetofinal-astroshop`;

INSERT IGNORE INTO categoria (nome, descricao)
VALUES
('Telescópios', 'Equipamentos para observação astronômica.'),
('Pêndulos', 'Equipamentos para estudos de movimento e gravidade.'),
('Gadgets de Física', 'Acessórios e equipamentos educacionais de física.'),
('Óptica', 'Materiais para experimentos de óptica.'),
('Instrumentos Científicos', 'Instrumentos utilizados em experiências científicas.');

INSERT INTO produto
(id_categoria, nome, descricao, preco, estoque, ativo)
SELECT id_categoria,
       'Telescópio Refrator 70mm',
       'Telescópio para observação da Lua e de objetos celestes brilhantes.',
       899.90, 15, TRUE
FROM categoria
WHERE nome = 'Telescópios'
AND NOT EXISTS (
    SELECT 1 FROM produto
    WHERE nome = 'Telescópio Refrator 70mm'
);

INSERT INTO produto
(id_categoria, nome, descricao, preco, estoque, ativo)
SELECT id_categoria,
       'Telescópio Refletor 130mm',
       'Equipamento refletor para observações astronômicas.',
       1499.90, 8, TRUE
FROM categoria
WHERE nome = 'Telescópios'
AND NOT EXISTS (
    SELECT 1 FROM produto
    WHERE nome = 'Telescópio Refletor 130mm'
);

INSERT INTO produto
(id_categoria, nome, descricao, preco, estoque, ativo)
SELECT id_categoria,
       'Pêndulo Simples Didático',
       'Conjunto para demonstração de movimento periódico.',
       129.90, 30, TRUE
FROM categoria
WHERE nome = 'Pêndulos'
AND NOT EXISTS (
    SELECT 1 FROM produto
    WHERE nome = 'Pêndulo Simples Didático'
);

INSERT INTO produto
(id_categoria, nome, descricao, preco, estoque, ativo)
SELECT id_categoria,
       'Kit de Óptica',
       'Kit educacional para experimentos de reflexão e refração.',
       219.90, 20, TRUE
FROM categoria
WHERE nome = 'Óptica'
AND NOT EXISTS (
    SELECT 1 FROM produto
    WHERE nome = 'Kit de Óptica'
);

INSERT INTO produto
(id_categoria, nome, descricao, preco, estoque, ativo)
SELECT id_categoria,
       'Cronômetro Digital',
       'Cronômetro para experimentos de física clássica.',
       79.90, 40, TRUE
FROM categoria
WHERE nome = 'Gadgets de Física'
AND NOT EXISTS (
    SELECT 1 FROM produto
    WHERE nome = 'Cronômetro Digital'
);

SELECT * FROM categoria;
SELECT * FROM produto;
