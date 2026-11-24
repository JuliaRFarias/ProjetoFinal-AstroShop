
import * as produtoModel from "../models/produtoModel.js";

function erroServidor(res, erro) {
    console.error(erro);
    return res.status(500).json({
        mensagem: "Erro interno do servidor."
    });
}

export async function listar(req, res) {
    try {
        const produtos = await produtoModel.listar();
        return res.json(produtos);
    } catch (erro) {
        return erroServidor(res, erro);
    }
}

export async function buscar(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do produto inválido."
            });
        }

        const produto = await produtoModel.buscarPorId(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        return res.json(produto);
    } catch (erro) {
        return erroServidor(res, erro);
    }
}

export async function criar(req, res) {
    try {
        const {
            id_categoria,
            nome,
            descricao,
            preco,
            estoque
        } = req.body;

        if (
            !id_categoria ||
            !nome?.trim() ||
            preco === undefined ||
            estoque === undefined ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) < 0 ||
            !Number.isInteger(Number(estoque)) ||
            Number(estoque) < 0
        ) {
            return res.status(400).json({
                mensagem: "Informe categoria, nome, preço e estoque válidos."
            });
        }

        const produto = await produtoModel.criar({
            id_categoria,
            nome: nome.trim(),
            descricao,
            preco: Number(preco),
            estoque: Number(estoque)
        });

        return res.status(201).json({
            mensagem: "Produto cadastrado com sucesso.",
            produto
        });
    } catch (erro) {
        return erroServidor(res, erro);
    }
}

export async function atualizar(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do produto inválido."
            });
        }

        const {
            id_categoria,
            nome,
            descricao,
            preco,
            estoque
        } = req.body;

        if (
            !id_categoria ||
            !nome?.trim() ||
            preco === undefined ||
            estoque === undefined ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) < 0 ||
            !Number.isInteger(Number(estoque)) ||
            Number(estoque) < 0
        ) {
            return res.status(400).json({
                mensagem: "Informe categoria, nome, preço e estoque válidos."
            });
        }

        const produto = await produtoModel.atualizar(id, {
            id_categoria,
            nome: nome.trim(),
            descricao,
            preco: Number(preco),
            estoque: Number(estoque)
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        return res.json({
            mensagem: "Produto atualizado com sucesso.",
            produto
        });
    } catch (erro) {
        return erroServidor(res, erro);
    }
}

export async function excluir(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do produto inválido."
            });
        }

        const excluido = await produtoModel.excluir(id);

        if (!excluido) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        return res.json({
            mensagem: "Produto desativado com sucesso."
        });
    } catch (erro) {
        return erroServidor(res, erro);
    }
}
