import * as compraModel from "../models/compraModel.js";
import * as notaFiscalModel from "../models/notaFiscalModel.js";

// LISTAR COMPRAS
export async function listar(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;

        const compras = await compraModel.listarPorCliente(idCliente);

        return res.status(200).json(compras);

    } catch (erro) {
        console.error("Erro ao listar compras:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar compras."
        });
    }
}

// FINALIZAR COMPRA
export async function finalizar(req, res) {
    try {
        if (!req.session?.usuario?.id_cliente) {
            return res.status(401).json({
                mensagem: "Faça login para finalizar sua compra."
            });
        }

        const idCliente = req.session.usuario.id_cliente;

        const resultado = await compraModel.finalizar(idCliente);

        return res.status(201).json({
            mensagem: "Compra registrada com sucesso!",
            id_compra: resultado.id_compra,
            valor_total: resultado.valor_total
        });

    } catch (erro) {
        console.error("Erro ao finalizar compra:", erro);

        const mensagem = erro.message || "Erro ao finalizar compra.";

        const status =
            mensagem === "O carrinho está vazio." ||
            mensagem.startsWith("Estoque insuficiente") ||
            mensagem.startsWith("Produto inválido")
                ? 400
                : 500;

        return res.status(status).json({
            mensagem
        });
    }
}

// BUSCAR COMPRA
export async function buscar(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;

        const compra = await compraModel.buscarPorId(req.params.id);

        if (
            !compra ||
            Number(compra.id_cliente) !== Number(idCliente)
        ) {
            return res.status(404).json({
                mensagem: "Compra não encontrada."
            });
        }

        return res.status(200).json(compra);

    } catch (erro) {
        console.error("Erro ao buscar compra:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar compra."
        });
    }
}

// CONSULTAR NOTA FISCAL
export async function notaFiscal(req, res) {
    try {
        const idCliente = req.session.usuario.id_cliente;

        const compra = await compraModel.buscarPorId(req.params.id);

        if (
            !compra ||
            Number(compra.id_cliente) !== Number(idCliente)
        ) {
            return res.status(404).json({
                mensagem: "Compra não encontrada."
            });
        }

        const nota = await notaFiscalModel.buscarPorCompra(req.params.id);

        if (!nota) {
            return res.status(404).json({
                mensagem: "Ainda não existe nota fiscal registrada para esta compra."
            });
        }

        return res.status(200).json(nota);

    } catch (erro) {
        console.error("Erro ao consultar nota fiscal:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar nota fiscal."
        });
    }
}