
const pool = require("../config/db");

async function listar(idCliente) {
  return pool.query(
    `SELECT
       c.id_produto,
       p.nome,
       p.preco,
       p.estoque,
       c.quantidade,
       (p.preco * c.quantidade) AS subtotal
     FROM carrinho_de_compra c
     INNER JOIN produto p
       ON p.id_produto = c.id_produto
     WHERE c.id_cliente = ?
       AND p.ativo = TRUE
     ORDER BY p.nome`,
    [idCliente]
  );
}

async function adicionar(idCliente, idProduto, quantidade) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const produtos = await conexao.query(
      `SELECT id_produto, estoque
       FROM produto
       WHERE id_produto = ? AND ativo = TRUE
       FOR UPDATE`,
      [idProduto]
    );

    if (!produtos.length) {
      throw new Error("Produto não encontrado.");
    }

    const itens = await conexao.query(
      `SELECT quantidade
       FROM carrinho_de_compra
       WHERE id_cliente = ? AND id_produto = ?`,
      [idCliente, idProduto]
    );

    const quantidadeAtual = itens.length
      ? Number(itens[0].quantidade)
      : 0;

    if (quantidadeAtual + quantidade > produtos[0].estoque) {
      throw new Error("Quantidade superior ao estoque.");
    }

    if (itens.length) {
      await conexao.query(
        `UPDATE carrinho_de_compra
         SET quantidade = ?
         WHERE id_cliente = ? AND id_produto = ?`,
        [quantidadeAtual + quantidade, idCliente, idProduto]
      );
    } else {
      await conexao.query(
        `INSERT INTO carrinho_de_compra
          (id_cliente, id_produto, quantidade)
         VALUES (?, ?, ?)`,
        [idCliente, idProduto, quantidade]
      );
    }

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }

  return listar(idCliente);
}

async function alterar(idCliente, idProduto, quantidade) {
  if (quantidade <= 0) {
    return remover(idCliente, idProduto);
  }

  const resultado = await pool.query(
    `UPDATE carrinho_de_compra c
     INNER JOIN produto p ON p.id_produto = c.id_produto
     SET c.quantidade = ?
     WHERE c.id_cliente = ?
       AND c.id_produto = ?
       AND p.ativo = TRUE
       AND p.estoque >= ?`,
    [quantidade, idCliente, idProduto, quantidade]
  );

  if (!resultado.affectedRows) {
    throw new Error(
      "Item não encontrado ou estoque insuficiente."
    );
  }

  return listar(idCliente);
}

async function remover(idCliente, idProduto) {
  await pool.query(
    `DELETE FROM carrinho_de_compra
     WHERE id_cliente = ? AND id_produto = ?`,
    [idCliente, idProduto]
  );

  return listar(idCliente);
}

async function limpar(idCliente) {
  await pool.query(
    "DELETE FROM carrinho_de_compra WHERE id_cliente = ?",
    [idCliente]
  );
}

module.exports = {
  listar,
  adicionar,
  alterar,
  remover,
  limpar
};
