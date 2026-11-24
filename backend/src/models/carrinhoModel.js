import pool from "../config/db.js";

// LOCALIZAR O CARRINHO ABERTO OU CRIAR UM NOVO
async function obterOuCriarCarrinho(conexao, idCliente) {
    // Bloqueia o registro do cliente durante a criação
    const [clientes] = await conexao.query(
        `SELECT id_cliente
         FROM cliente
         WHERE id_cliente = ?
         FOR UPDATE`,
        [idCliente]
    );

    if (clientes.length === 0) {
        throw new Error("Cliente não encontrado.");
    }

    const [carrinhos] = await conexao.query(
        `SELECT id_carrinho
         FROM carrinho
         WHERE id_cliente = ?
           AND status = 'aberto'
         ORDER BY id_carrinho DESC
         LIMIT 1
         FOR UPDATE`,
        [idCliente]
    );

    if (carrinhos.length > 0) {
        return carrinhos[0].id_carrinho;
    }

    const [resultado] = await conexao.query(
        `INSERT INTO carrinho (id_cliente)
         VALUES (?)`,
        [idCliente]
    );

    return resultado.insertId;
}

// LISTAR OS PRODUTOS DO CARRINHO
export async function listar(idCliente) {
    const [rows] = await pool.query(
        `SELECT
            item.id_item_carrinho,
            item.id_produto,
            produto.nome,
            item.preco_unitario AS preco,
            produto.estoque,
            item.quantidade,
            (item.preco_unitario * item.quantidade) AS subtotal
         FROM carrinho
         INNER JOIN carrinho_de_compra AS item
            ON item.id_carrinho = carrinho.id_carrinho
         INNER JOIN produto
            ON produto.id_produto = item.id_produto
         WHERE carrinho.id_cliente = ?
           AND carrinho.status = 'aberto'
           AND produto.ativo = TRUE
         ORDER BY produto.nome`,
        [idCliente]
    );

    return rows;
}

// ADICIONAR PRODUTO AO CARRINHO
export async function adicionar(idCliente, idProduto, quantidade) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const idCarrinho = await obterOuCriarCarrinho(
            conexao,
            idCliente
        );

        // Verificar se o produto existe e está ativo
        const [produtos] = await conexao.query(
            `SELECT id_produto, preco, estoque
             FROM produto
             WHERE id_produto = ?
               AND ativo = TRUE
             FOR UPDATE`,
            [idProduto]
        );

        if (produtos.length === 0) {
            throw new Error("Produto não encontrado.");
        }

        const produto = produtos[0];

        // Verificar se o produto já está no carrinho
        const [itens] = await conexao.query(
            `SELECT id_item_carrinho, quantidade
             FROM carrinho_de_compra
             WHERE id_carrinho = ?
               AND id_produto = ?
             FOR UPDATE`,
            [idCarrinho, idProduto]
        );

        const quantidadeAtual = itens.length > 0
            ? Number(itens[0].quantidade)
            : 0;

        const novaQuantidade = quantidadeAtual + quantidade;

        // Verificar estoque
        if (novaQuantidade > Number(produto.estoque)) {
            throw new Error("Quantidade superior ao estoque.");
        }

        if (itens.length > 0) {
            // Atualizar quantidade e preço
            await conexao.query(
                `UPDATE carrinho_de_compra
                 SET quantidade = ?,
                     preco_unitario = ?
                 WHERE id_item_carrinho = ?`,
                [
                    novaQuantidade,
                    produto.preco,
                    itens[0].id_item_carrinho
                ]
            );
        } else {
            // Inserir novo produto
            await conexao.query(
                `INSERT INTO carrinho_de_compra
                    (id_carrinho, id_produto, quantidade, preco_unitario)
                 VALUES (?, ?, ?, ?)`,
                [
                    idCarrinho,
                    idProduto,
                    quantidade,
                    produto.preco
                ]
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

// ALTERAR A QUANTIDADE DE UM PRODUTO
export async function alterar(idCliente, idProduto, quantidade) {
    if (quantidade === 0) {
        return remover(idCliente, idProduto);
    }

    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const [carrinhos] = await conexao.query(
            `SELECT id_carrinho
             FROM carrinho
             WHERE id_cliente = ?
               AND status = 'aberto'
             ORDER BY id_carrinho DESC
             LIMIT 1
             FOR UPDATE`,
            [idCliente]
        );

        if (carrinhos.length === 0) {
            throw new Error("Carrinho não encontrado.");
        }

        const idCarrinho = carrinhos[0].id_carrinho;

        const [produtos] = await conexao.query(
            `SELECT estoque, ativo
             FROM produto
             WHERE id_produto = ?
             FOR UPDATE`,
            [idProduto]
        );

        if (
            produtos.length === 0 ||
            !produtos[0].ativo
        ) {
            throw new Error("Produto não encontrado ou inativo.");
        }

        if (quantidade > Number(produtos[0].estoque)) {
            throw new Error("Quantidade superior ao estoque.");
        }

        const [resultado] = await conexao.query(
            `UPDATE carrinho_de_compra
             SET quantidade = ?
             WHERE id_carrinho = ?
               AND id_produto = ?`,
            [quantidade, idCarrinho, idProduto]
        );

        if (resultado.affectedRows === 0) {
            throw new Error("Produto não encontrado no carrinho.");
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

// REMOVER UM PRODUTO DO CARRINHO
export async function remover(idCliente, idProduto) {
    await pool.query(
        `DELETE item
         FROM carrinho_de_compra AS item
         INNER JOIN carrinho
            ON carrinho.id_carrinho = item.id_carrinho
         WHERE carrinho.id_cliente = ?
           AND carrinho.status = 'aberto'
           AND item.id_produto = ?`,
        [idCliente, idProduto]
    );

    return listar(idCliente);
}

// ESVAZIAR O CARRINHO
export async function limpar(idCliente) {
    await pool.query(
        `DELETE item
         FROM carrinho_de_compra AS item
         INNER JOIN carrinho
            ON carrinho.id_carrinho = item.id_carrinho
         WHERE carrinho.id_cliente = ?
           AND carrinho.status = 'aberto'`,
        [idCliente]
    );

    return {
        mensagem: "Carrinho esvaziado com sucesso."
    };
}