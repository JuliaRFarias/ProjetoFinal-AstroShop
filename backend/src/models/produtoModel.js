
const pool = require("../config/db");

async function listar() {
  return pool.query(`
    SELECT p.*, c.nome AS categoria
    FROM produto p
    INNER JOIN categoria c
      ON c.id_categoria = p.id_categoria
    WHERE p.ativo = TRUE
    ORDER BY p.nome
  `);
}

async function buscarPorId(id) {
  const rows = await pool.query(
    `SELECT p.*, c.nome AS categoria
     FROM produto p
     INNER JOIN categoria c
       ON c.id_categoria = p.id_categoria
     WHERE p.id_produto = ?`,
    [id]
  );

  return rows[0] || null;
}

async function criar(dados) {
  const { id_categoria, nome, descricao, preco, estoque } = dados;

  const resultado = await pool.query(
    `INSERT INTO produto
      (id_categoria, nome, descricao, preco, estoque)
     VALUES (?, ?, ?, ?, ?)`,
    [id_categoria, nome, descricao || null, preco, estoque]
  );

  return buscarPorId(Number(resultado.insertId));
}

async function atualizar(id, dados) {
  const { id_categoria, nome, descricao, preco, estoque } = dados;

  const resultado = await pool.query(
    `UPDATE produto
     SET id_categoria = ?, nome = ?, descricao = ?,
         preco = ?, estoque = ?
     WHERE id_produto = ?`,
    [id_categoria, nome, descricao || null, preco, estoque, id]
  );

  if (!resultado.affectedRows) return null;
  return buscarPorId(id);
}

async function excluir(id) {
  // Desativação lógica: preserva o histórico de vendas.
  const resultado = await pool.query(
    `UPDATE produto SET ativo = FALSE
     WHERE id_produto = ?`,
    [id]
  );

  return resultado.affectedRows > 0;
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir
};
