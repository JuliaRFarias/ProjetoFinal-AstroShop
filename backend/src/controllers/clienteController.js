
import * as clienteModel from "../models/clienteModel.js";

function erroServidor(res, erro) {
    console.error(erro);
    return res.status(500).json({
        mensagem: "Erro interno do servidor."
    });
}

export async function listar(req, res) {
    try {
        const clientes = await clienteModel.listar();
        return res.json(clientes);
    } catch (erro) {
        return erroServidor(res, erro);
    }
}

export async function buscar(req, res) {
    try {
        const cliente = await clienteModel.buscarPorId(req.params.id);

        if (!cliente) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        return res.json(cliente);
    } catch (erro) {
        return erroServidor(res, erro);
    }
}

export async function criar(req, res) {
    try {
        const { nome, email, telefone } = req.body;

        if (!nome?.trim() || !email?.trim()) {
            return res.status(400).json({
                mensagem: "Nome e e-mail são obrigatórios."
            });
        }

        const existente = await clienteModel.buscarPorEmail(email.trim());

        if (existente) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        const cliente = await clienteModel.criar({
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            telefone
        });

        return res.status(201).json(cliente);
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "E-mail já cadastrado."
            });
        }

        return erroServidor(res, erro);
    }
}

export async function atualizar(req, res) {
    try {
        const { nome, telefone, email } = req.body;

        if (!nome?.trim() || !email?.trim()) {
            return res.status(400).json({
                mensagem: "Nome e e-mail são obrigatórios."
            });
        }

        const cliente = await clienteModel.atualizar(req.params.id, {
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            telefone
        });

        if (!cliente) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        return res.json(cliente);
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "E-mail já cadastrado."
            });
        }

        return erroServidor(res, erro);
    }
}

export async function excluir(req, res) {
    try {
        const excluido = await clienteModel.desativar(req.params.id);

        if (!excluido) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Cliente excluído."
        });
    } catch (erro) {
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensagem: "Cliente possui registros relacionados."
            });
        }

        return erroServidor(res, erro);
    }
}

