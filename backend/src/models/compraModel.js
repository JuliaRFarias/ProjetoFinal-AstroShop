
const pool = require("../config/db");

async function listarPorCliente(idCliente) {
  return pool.query(
    `SELECT id_compra, id_cliente, data_compra,
            valor_total, status
     FROM compra
     WHERE id_cliente = ?
     ORDER BY id_compra DESC`,
    [idCliente]
  );
}

async function buscarPorId(idCompra) {
  const compras = await pool.query(
    `SELECT * FROM compra WHERE id_compra = ?`,
    [idCompra]
  );

  if (!compras.length) return null;

  const itens = await pool.query(
    `SELECT ic.*, p.nome AS produto
     FROM item_compra ic
     INNER JOIN produto p
       ON p.id_produto = ic.id_produto
     WHERE ic.id_compra = ?`,
    [idCompra]
  );

  return { ...compras[0], itens };
}

async function finalizar(idCliente) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const carrinho = await conexao.query(
      `SELECT c.id_produto, c.quantidade,
              p.nome, p.preco, p.estoque
       FROM carrinho_de_compra c
       INNER JOIN produto p
         ON p.id_produto = c.id_produto
       WHERE c.id_cliente = ? AND p.ativo = TRUE
       ORDER BY c.id_produto
       FOR UPDATE`,
      [idCliente]
    );

    if (!carrinho.length) {
      throw new Error("O carrinho está vazio.");
    }

    let total = 0;

    for (const item of carrinho) {
      if (
        Number(item.quantidade) <= 0 ||
        Number(item.quantidade) > Number(item.estoque)
      ) {
        throw new Error(
          `Estoque insuficiente para ${item.nome}.`
        );
      }

      total += Number(item.preco) * Number(item.quantidade);
    }

    const compra = await conexao.query(
      `INSERT INTO compra
        (id_cliente, data_compra, valor_total, status)
       VALUES (?, NOW(), ?, 'Paga')`,
      [idCliente, total]
    );

    const idCompra = Number(compra.insertId);

    for (const item of carrinho) {
      await conexao.query(
        `INSERT INTO item_compra
          (id_compra, id_produto, quantidade,
           preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          idCompra,
          item.id_produto,
          item.quantidade,
          item.preco,
          Number(item.preco) * Number(item.quantidade)
        ]
      );

      const atualizacao = await conexao.query(
        `UPDATE produto
         SET estoque = estoque - ?
         WHERE id_produto = ? AND estoque >= ?`,
        [item.quantidade, item.id_produto, item.quantidade]
      );

      if (!atualizacao.affectedRows) {
        throw new Error(
          `Estoque insuficiente para ${item.nome}.`
        );
      }
    }

    await conexao.query(
      `INSERT INTO venda
        (id_compra, data_venda, valor_total, status)
       VALUES (?, NOW(), ?, 'Concluida')`,
      [idCompra, total]
    );

    await conexao.query(
      `DELETE FROM carrinho_de_compra
       WHERE id_cliente = ?`,
      [idCliente]
    );

    await conexao.commit();

    return { id_compra: idCompra, valor_total: total };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = {
  listarPorCliente,
  buscarPorId,
  finalizar
};
