
import pool from "../config/db.js";

// LISTAR COMPRAS DO CLIENTE
export async function listarPorCliente(idCliente) {
    const [compras] = await pool.query(
        `SELECT
            id_compra,
            id_cliente,
            data_compra,
            valor_total,
            status
         FROM compra
         WHERE id_cliente = ?
         ORDER BY id_compra DESC`,
        [idCliente]
    );

    return compras;
}

// BUSCAR UMA COMPRA E SEUS ITENS
export async function buscarPorId(idCompra) {
    const [compras] = await pool.query(
        `SELECT *
         FROM compra
         WHERE id_compra = ?`,
        [idCompra]
    );

    if (compras.length === 0) {
        return null;
    }

    const [itens] = await pool.query(
        `SELECT
            ic.*,
            p.nome AS produto
         FROM item_compra ic
         INNER JOIN produto p
            ON p.id_produto = ic.id_produto
         WHERE ic.id_compra = ?`,
        [idCompra]
    );

    return {
        ...compras[0],
        itens
    };
}

// FINALIZAR COMPRA
export async function finalizar(idCliente) {
    const conexao = await pool.getConnection();
    let transacaoIniciada = false;

    try {
        await conexao.beginTransaction();
        transacaoIniciada = true;

        // BUSCAR OS PRODUTOS DO CARRINHO
        const [carrinho] = await conexao.query(
            `SELECT
                ca.id_carrinho,
                ci.id_produto,
                ci.quantidade,
                p.nome,
                p.preco,
                p.estoque,
                p.ativo
             FROM carrinho ca
             INNER JOIN carrinho_de_compra ci
                ON ci.id_carrinho = ca.id_carrinho
             INNER JOIN produto p
                ON p.id_produto = ci.id_produto
             WHERE ca.id_cliente = ?
               AND ca.status = 'aberto'
             ORDER BY ci.id_produto
             FOR UPDATE`,
            [idCliente]
        );

        if (carrinho.length === 0) {
            throw new Error("O carrinho está vazio.");
        }

        // AGRUPAR PRODUTOS REPETIDOS ENTRE CARRINHOS ABERTOS
        const produtosAgrupados = new Map();

        for (const item of carrinho) {
            const idProduto = Number(item.id_produto);

            if (!produtosAgrupados.has(idProduto)) {
                produtosAgrupados.set(idProduto, {
                    id_produto: idProduto,
                    nome: item.nome,
                    preco: Number(item.preco),
                    estoque: Number(item.estoque),
                    ativo: Number(item.ativo),
                    quantidade: 0
                });
            }

            produtosAgrupados.get(idProduto).quantidade +=
                Number(item.quantidade);
        }

        const produtos = [...produtosAgrupados.values()];

        // VALIDAR ESTOQUE E CALCULAR TOTAL EM CENTAVOS
        let totalCentavos = 0;

        for (const item of produtos) {
            if (
                !Number.isInteger(item.quantidade) ||
                item.quantidade <= 0 ||
                !Number.isFinite(item.preco) ||
                item.preco < 0
            ) {
                throw new Error(`Produto inválido: ${item.nome}.`);
            }

            if (item.ativo !== 1) {
                throw new Error(`O produto ${item.nome} está inativo.`);
            }

            if (item.quantidade > item.estoque) {
                throw new Error(
                    `Estoque insuficiente para ${item.nome}. Disponível: ${item.estoque}.`
                );
            }

            totalCentavos +=
                Math.round(item.preco * 100) * item.quantidade;
        }

        const total = Number((totalCentavos / 100).toFixed(2));

        // REGISTRAR COMPRA
        const [resultadoCompra] = await conexao.query(
            `INSERT INTO compra
                (id_cliente, data_compra, valor_total, status)
             VALUES (?, NOW(), ?, 'confirmada')`,
            [idCliente, total]
        );

        const idCompra = resultadoCompra.insertId;

        // REGISTRAR ITENS E ATUALIZAR ESTOQUE
        for (const item of produtos) {
            await conexao.query(
                `INSERT INTO item_compra
                    (id_compra, id_produto, quantidade, preco_unitario)
                 VALUES (?, ?, ?, ?)`,
                [
                    idCompra,
                    item.id_produto,
                    item.quantidade,
                    item.preco
                ]
            );

            const [atualizacao] = await conexao.query(
                `UPDATE produto
                 SET estoque = estoque - ?
                 WHERE id_produto = ?
                   AND ativo = TRUE
                   AND estoque >= ?`,
                [
                    item.quantidade,
                    item.id_produto,
                    item.quantidade
                ]
            );

            if (atualizacao.affectedRows !== 1) {
                throw new Error(
                    `Estoque insuficiente para ${item.nome}.`
                );
            }
        }

        // REGISTRAR VENDA
        const [resultadoVenda] = await conexao.query(
            `INSERT INTO venda
                (id_compra, data_venda, valor_total, status)
             VALUES (?, NOW(), ?, 'registrada')`,
            [idCompra, total]
        );

        const idVenda = resultadoVenda.insertId;

        // IDENTIFICAR TODOS OS CARRINHOS UTILIZADOS
        const idsCarrinhos = [
            ...new Set(carrinho.map(item => Number(item.id_carrinho)))
        ];

        // REMOVER OS ITENS DOS CARRINHOS
        await conexao.query(
            `DELETE FROM carrinho_de_compra
             WHERE id_carrinho IN (?)`,
            [idsCarrinhos]
        );

        // FINALIZAR OS CARRINHOS
        await conexao.query(
            `UPDATE carrinho
             SET status = 'finalizado'
             WHERE id_carrinho IN (?)
               AND id_cliente = ?`,
            [idsCarrinhos, idCliente]
        );

        // CONFIRMAR TRANSAÇÃO
        await conexao.commit();
        transacaoIniciada = false;

        return {
            id_compra: Number(idCompra),
            id_venda: Number(idVenda),
            valor_total: total
        };

    } catch (erro) {
        if (transacaoIniciada) {
            await conexao.rollback();
        }

        throw erro;

    } finally {
        conexao.release();
    }
}


