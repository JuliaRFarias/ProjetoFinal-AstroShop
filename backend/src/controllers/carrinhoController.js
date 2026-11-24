
import * as carrinhoModel from "../models/carrinhoModel.js";

async function listar(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;
        const itens = await carrinhoModel.listar(idCliente);

        const total = itens.reduce(
            (soma, item) =>
                soma + Number(item.preco) * Number(item.quantidade),
            0
        );

        return res.json({ itens, total });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao consultar carrinho."
        });
    }
}

async function adicionar(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;
        const idProduto = Number(req.body.id_produto);
        const quantidade = Number(req.body.quantidade ?? 1);

        if (
            !Number.isInteger(idProduto) ||
            idProduto <= 0 ||
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            return res.status(400).json({
                mensagem: "Informe produto e quantidade válidos."
            });
        }

        const itens = await carrinhoModel.adicionar(
            idCliente,
            idProduto,
            quantidade
        );

        return res.status(201).json({
            mensagem: "Produto adicionado.",
            itens
        });
    } catch (erro) {
        console.error(erro);

        const mensagem = erro.message || "Erro ao adicionar produto.";

        const status =
            mensagem.includes("não encontrado") ||
            mensagem.includes("superior ao estoque")
                ? 400
                : 500;

        return res.status(status).json({ mensagem });
    }
}

async function alterar(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;
        const idProduto = Number(req.params.idProduto);
        const quantidade = Number(req.body.quantidade);

        if (
            !Number.isInteger(idProduto) ||
            idProduto <= 0 ||
            !Number.isInteger(quantidade) ||
            quantidade < 0
        ) {
            return res.status(400).json({
                mensagem: "Informe uma quantidade válida."
            });
        }

        const itens = await carrinhoModel.alterar(
            idCliente,
            idProduto,
            quantidade
        );

        return res.json({
            mensagem: "Carrinho atualizado.",
            itens
        });
    } catch (erro) {
        console.error(erro);
        return res.status(400).json({
            mensagem: erro.message
        });
    }
}

async function remover(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;
        const idProduto = Number(req.params.idProduto);

        if (!Number.isInteger(idProduto) || idProduto <= 0) {
            return res.status(400).json({
                mensagem: "ID do produto inválido."
            });
        }

        const itens = await carrinhoModel.remover(
            idCliente,
            idProduto
        );

        return res.json({
            mensagem: "Item removido.",
            itens
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao remover item."
        });
    }
}

async function excluir(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;

        await carrinhoModel.limpar(idCliente);

        return res.json({
            mensagem: "Carrinho esvaziado."
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao esvaziar carrinho."
        });
    }
}

export {
    listar,
    adicionar,
    alterar,
    remover,
    excluir
};
