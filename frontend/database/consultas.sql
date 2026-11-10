USE projeto_integrador;

-- 1. Listar todos os produtos e suas categorias

SELECT
    p.id_produto,
    p.nome AS produto,
    c.nome AS categoria,
    p.preco,
    p.estoque
FROM produto p
INNER JOIN categoria c
    ON p.id_categoria = c.id_categoria;


-- 2. Consultar os dados completos dos clientes

SELECT
    cl.id_cliente,
    cl.nome,
    cl.email,
    cl.telefone,
    ca.cpf,
    ca.cidade,
    ca.estado
FROM cliente cl
INNER JOIN cadastro ca
    ON cl.id_cliente = ca.id_cliente;


-- 3. Consultar compras e clientes

SELECT
    co.id_compra,
    cl.nome AS cliente,
    co.valor_total,
    co.status,
    co.data_compra
FROM compra co
INNER JOIN cliente cl
    ON co.id_cliente = cl.id_cliente;


-- 4. Consultar os produtos de cada compra

SELECT
    co.id_compra,
    cl.nome AS cliente,
    p.nome AS produto,
    ic.quantidade,
    ic.preco_unitario,
    (ic.quantidade * ic.preco_unitario) AS subtotal
FROM item_compra ic
INNER JOIN compra co
    ON ic.id_compra = co.id_compra
INNER JOIN cliente cl
    ON co.id_cliente = cl.id_cliente
INNER JOIN produto p
    ON ic.id_produto = p.id_produto;


-- 5. Consultar vendas e notas fiscais demonstrativas

SELECT
    v.codigo_venda,
    nf.numero AS nota_fiscal,
    cl.nome AS cliente,
    v.valor_total,
    v.data_venda
FROM venda v
INNER JOIN compra co
    ON v.id_compra = co.id_compra
INNER JOIN cliente cl
    ON co.id_cliente = cl.id_cliente
INNER JOIN nota_fiscal nf
    ON nf.id_compra = co.id_compra;


-- 6. Consultar os itens do carrinho

SELECT
    cl.nome AS cliente,
    p.nome AS produto,
    ic.quantidade,
    p.preco,
    (ic.quantidade * p.preco) AS subtotal
FROM item_carrinho ic
INNER JOIN carrinho_de_compra ca
    ON ic.id_carrinho = ca.id_carrinho
INNER JOIN cliente cl
    ON ca.id_cliente = cl.id_cliente
INNER JOIN produto p
    ON ic.id_produto = p.id_produto;


-- 7. Consultar perguntas dos clientes

SELECT
    con.id_consulta,
    cl.nome AS cliente,
    p.nome AS produto,
    con.assunto,
    con.mensagem,
    con.status
FROM consulta con
INNER JOIN cliente cl
    ON con.id_cliente = cl.id_cliente
LEFT JOIN produto p
    ON con.id_produto = p.id_produto;


-- 8. Produtos com estoque baixo

SELECT
    nome,
    estoque,
    preco
FROM produto
WHERE estoque <= 5
AND ativo = TRUE;


-- 9. Total vendido

SELECT
    SUM(valor_total) AS faturamento_total
FROM venda
WHERE status = 'REGISTRADA';


-- 10. Quantidade de compras por cliente

SELECT
    cl.nome,
    COUNT(co.id_compra) AS quantidade_compras
FROM cliente cl
LEFT JOIN compra co
    ON cl.id_cliente = co.id_cliente
GROUP BY cl.id_cliente, cl.nome;


-- 11. Produtos mais vendidos

SELECT
    p.nome,
    SUM(ic.quantidade) AS quantidade_vendida
FROM item_compra ic
INNER JOIN produto p
    ON ic.id_produto = p.id_produto
INNER JOIN compra co
    ON ic.id_compra = co.id_compra
WHERE co.status <> 'CANCELADA'
GROUP BY p.id_produto, p.nome
ORDER BY quantidade_vendida DESC;


-- 12. Histórico de compras de um cliente

SELECT
    co.id_compra,
    co.status,
    co.valor_total,
    co.data_compra
FROM compra co
WHERE co.id_cliente = 1
ORDER BY co.data_compra DESC;