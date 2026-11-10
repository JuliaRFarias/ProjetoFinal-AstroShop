
const carrinhoModel = require("../models/carrinhoModel");

async function listar(req, res) {
  try {
    const itens = await carrinhoModel.listar(req.user.id_cliente);

    const total = itens.reduce(
      (soma, item) =>
        soma + Number(item.preco) * Number(item.quantidade),
      0
    );

    res.json({ itens, total });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao consultar carrinho." });
  }
}

async function adicionar(req, res) {
  try {
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
      req.user.id_cliente,
      idProduto,
      quantidade
    );

    res.status(201).json({ mensagem: "Produto adicionado.", itens });
  } catch (erro) {
    const status = erro.message.includes("não encontrado") ||
      erro.message.includes("superior ao estoque")
      ? 400
      : 500;

    console.error(erro);
    res.status(status).json({ mensagem: erro.message });
  }
}

async function alterar(req, res) {
  try {
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
      req.user.id_cliente,
      idProduto,
      quantidade
    );

    res.json({ mensagem: "Carrinho atualizado.", itens });
  } catch (erro) {
    console.error(erro);
    res.status(400).json({ mensagem: erro.message });
  }
}

async function remover(req, res) {
  try {
    const itens = await carrinhoModel.remover(
      req.user.id_cliente,
      Number(req.params.idProduto)
    );

    res.json({ mensagem: "Item removido.", itens });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao remover item." });
  }
}

async function excluir(req, res) {
  try {
    await carrinhoModel.limpar(req.user.id_cliente);
    res.json({ mensagem: "Carrinho esvaziado." });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao esvaziar carrinho." });
  }
}

module.exports = { listar, adicionar, alterar, remover, excluir };
