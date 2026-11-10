
import pool from "../config/db";

export async function listar(idCliente) {
  const [rows] = await pool.query(
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

  return rows;
}

// ADICIONAR PRODUTO AO CARRINHO
export async function adicionar(idCliente, idProduto, quantidade) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    // VERIFICAR SE O PRODUTO EXISTE E ESTÁ ATIVO
    const [produtos] = await conexao.query(
      `SELECT id_produto, estoque
       FROM produto
       WHERE id_produto = ?
         AND ativo = TRUE
       FOR UPDATE`,
      [idProduto]
    );

    if (produtos.length === 0) {
      throw new Error("Produto não encontrado.");
    }

    // VERIFICAR SE O PRODUTO JÁ ESTÁ NO CARRINHO
    const [itens] = await conexao.query(
      `SELECT quantidade
       FROM carrinho_de_compra
       WHERE id_cliente = ?
         AND id_produto = ?`,
      [idCliente, idProduto]
    );

    const quantidadeAtual = itens.length > 0
      ? Number(itens[0].quantidade)
      : 0;

    // VERIFICAR SE EXISTE ESTOQUE DISPONÍVEL
    if (quantidadeAtual + quantidade > produtos[0].estoque) {
      throw new Error("Quantidade superior ao estoque.");
    }

    // ATUALIZAR OU INSERIR O PRODUTO
    if (itens.length > 0) {
      await conexao.query(
        `UPDATE carrinho_de_compra
         SET quantidade = ?
         WHERE id_cliente = ?
           AND id_produto = ?`,
        [
          quantidadeAtual + quantidade,
          idCliente,
          idProduto
        ]
      );
    } else {
      await conexao.query(
        `INSERT INTO carrinho_de_compra
          (id_cliente, id_produto, quantidade)
         VALUES (?, ?, ?)`,
        [idCliente, idProduto, quantidade]
      );
    }

    // CONFIRMAR A TRANSAÇÃO
    await conexao.commit();

  } catch (erro) {
    // DESFAZER SE OCORRER ALGUM ERRO
    await conexao.rollback();
    throw erro;

  } finally {
    // LIBERAR A CONEXÃO
    conexao.release();
  }

  return listar(idCliente);
}

// ALTERAR A QUANTIDADE DE UM PRODUTO
export async function alterar(idCliente, idProduto, quantidade) {
  if (quantidade <= 0) {
    return remover(idCliente, idProduto);
  }

  const [resultado] = await pool.query(
    `UPDATE carrinho_de_compra c
     INNER JOIN produto p
       ON p.id_produto = c.id_produto
     SET c.quantidade = ?
     WHERE c.id_cliente = ?
       AND c.id_produto = ?
       AND p.ativo = TRUE
       AND p.estoque >= ?`,
    [
      quantidade,
      idCliente,
      idProduto,
      quantidade
    ]
  );

  if (resultado.affectedRows === 0) {
    throw new Error(
      "Item não encontrado ou estoque insuficiente."
    );
  }

  return listar(idCliente);
}

// REMOVER UM PRODUTO DO CARRINHO
export async function remover(idCliente, idProduto) {
  await pool.query(
    `DELETE FROM carrinho_de_compra
     WHERE id_cliente = ?
       AND id_produto = ?`,
    [idCliente, idProduto]
  );

  return listar(idCliente);
}

// ESVAZIAR O CARRINHO
export async function limpar(idCliente) {
  await pool.query(
    `DELETE FROM carrinho_de_compra
     WHERE id_cliente = ?`,
    [idCliente]
  );

  return {
    mensagem: "Carrinho esvaziado com sucesso."
  };
}
