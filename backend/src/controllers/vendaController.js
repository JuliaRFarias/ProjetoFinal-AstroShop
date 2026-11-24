
import * as vendaModel from "../models/vendaModel.js";

export async function listar(req, res) {
    try {
        if (req.session.usuario.tipo !== "ADMIN") {
            return res.status(403).json({
                mensagem: "Apenas administradores podem listar todas as vendas."
            });
        }

        const vendas = await vendaModel.listar();

        return res.json(vendas);

    } catch (erro) {
        console.error("ERRO AO LISTAR VENDAS:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar vendas."
        });
    }
}

export async function buscarPorId(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID de venda inválido."
            });
        }

        const venda = await vendaModel.buscarPorId(id);

        if (!venda) {
            return res.status(404).json({
                mensagem: "Venda não encontrada."
            });
        }

        const usuario = req.session.usuario;

        if (
            usuario.tipo !== "ADMIN" &&
            Number(usuario.id_cliente) !== Number(venda.id_cliente)
        ) {
            return res.status(403).json({
                mensagem: "Você não pode acessar esta venda."
            });
        }

        return res.json(venda);

    } catch (erro) {
        console.error("ERRO AO BUSCAR VENDA:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar venda."
        });
    }
}

export async function atualizarStatus(req, res) {
    try {
        if (req.session.usuario.tipo !== "ADMIN") {
            return res.status(403).json({
                mensagem: "Apenas administradores podem atualizar vendas."
            });
        }

        const id = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(id) || id <= 0 || !status?.trim()) {
            return res.status(400).json({
                mensagem: "Informe um ID e um status válido."
            });
        }

        const venda = await vendaModel.atualizarStatus(
            id,
            status.trim()
        );

        if (!venda) {
            return res.status(404).json({
                mensagem: "Venda não encontrada."
            });
        }

        return res.json({
            mensagem: "Status da venda atualizado com sucesso.",
            venda
        });

    } catch (erro) {
        console.error("ERRO AO ATUALIZAR VENDA:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar status da venda."
        });
    }
}
