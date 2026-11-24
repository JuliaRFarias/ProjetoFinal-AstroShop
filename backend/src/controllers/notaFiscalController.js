
import * as notaFiscalModel from "../models/notaFiscalModel.js";

export async function buscarPorCompra(req, res) {
    try {
        const idCompra = Number(req.params.idCompra);

        if (!Number.isInteger(idCompra) || idCompra <= 0) {
            return res.status(400).json({
                mensagem: "ID da compra inválido."
            });
        }

        const notaFiscal = await notaFiscalModel.buscarPorCompra(idCompra);

        if (!notaFiscal) {
            return res.status(404).json({
                mensagem: "Nota fiscal não encontrada."
            });
        }

        const usuario = req.session.usuario;

        if (
            usuario.tipo !== "ADMIN" &&
            Number(usuario.id_cliente) !== Number(notaFiscal.id_cliente)
        ) {
            return res.status(403).json({
                mensagem: "Você não pode acessar esta nota fiscal."
            });
        }

        return res.json(notaFiscal);

    } catch (erro) {
        console.error("ERRO AO BUSCAR NOTA FISCAL:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar nota fiscal."
        });
    }
}

export async function listarPorCliente(req, res) {
    try {
        const usuario = req.session.usuario;

        const notas = await notaFiscalModel.listarPorCliente(
            usuario.id_cliente
        );

        return res.json(notas);

    } catch (erro) {
        console.error("ERRO AO LISTAR NOTAS:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar notas fiscais."
        });
    }
}
