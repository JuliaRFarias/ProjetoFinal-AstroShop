
const compraModel = require("../models/compraModel");
const notaFiscalModel = require("../models/notaFiscalModel");

async function listar(req, res) {
  try {
    // O ID deve vir do token autenticado.
    const idCliente = req.user.id_cliente;
    const compras = await compraModel.listarPorCliente(idCliente);
    res.json(compras);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao consultar compras." });
  }
}

async function finalizar(req, res) {
  try {
    const resultado = await compraModel.finalizar(req.user.id_cliente);

    res.status(201).json({
      mensagem: "Compra registrada com sucesso.",
      ...resultado
    });
  } catch (erro) {
    console.error(erro);

    const mensagem = erro.message || "Erro ao finalizar compra.";
    const status = [
      "O carrinho está vazio.",
    ].includes(mensagem) ||
      mensagem.startsWith("Estoque insuficiente")
      ? 400
      : 500;

    res.status(status).json({ mensagem });
  }
}

async function buscar(req, res) {
  try {
    const compra = await compraModel.buscarPorId(req.params.id);

    if (!compra || Number(compra.id_cliente) !== Number(req.user.id_cliente)) {
      return res.status(404).json({ mensagem: "Compra não encontrada." });
    }

    res.json(compra);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao consultar compra." });
  }
}

async function notaFiscal(req, res) {
  try {
    const compra = await compraModel.buscarPorId(req.params.id);

    if (!compra || Number(compra.id_cliente) !== Number(req.user.id_cliente)) {
      return res.status(404).json({ mensagem: "Compra não encontrada." });
    }

    const nota = await notaFiscalModel.buscarPorCompra(req.params.id);

    if (!nota) {
      return res.status(404).json({
        mensagem: "Ainda não existe nota fiscal registrada para esta compra."
      });
    }

    res.json(nota);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao consultar nota fiscal." });
  }
}

module.exports = { listar, finalizar, buscar, notaFiscal };
