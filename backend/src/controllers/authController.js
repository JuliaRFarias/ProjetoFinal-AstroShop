
import bcrypt from "bcryptjs";
import * as clienteModel from "../models/clienteModel.js";

// CADASTRAR CLIENTE
export async function cadastrar(req, res) {
    try {
        const { nome, email, telefone, senha } = req.body;

        if (!nome?.trim() || !email?.trim() || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos obrigatórios."
            });
        }

        if (senha.length < 8) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 8 caracteres."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const clienteExistente =
            await clienteModel.buscarPorEmail(emailNormalizado);

        if (clienteExistente) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await clienteModel.criar({
            nome: nome.trim(),
            email: emailNormalizado,
            telefone: telefone?.trim() || null,
            senhaHash
        });

        return res.status(201).json({
            mensagem: "Cadastro realizado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao realizar cadastro."
        });
    }
}

// REALIZAR LOGIN
export async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email?.trim() || !senha) {
            return res.status(400).json({
                mensagem: "Informe seu e-mail e sua senha."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const usuario =
            await clienteModel.buscarPorEmail(emailNormalizado);

        if (!usuario) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        req.session.regenerate((erro) => {
            if (erro) {
                console.error("Erro ao criar sessão:", erro);

                return res.status(500).json({
                    mensagem: "Não foi possível iniciar sua sessão."
                });
            }

            req.session.usuario = {
                id_cliente: usuario.id_cliente,
                nome: usuario.nome,
                email: usuario.email
            };

            req.session.save((erroSalvar) => {
                if (erroSalvar) {
                    console.error(
                        "Erro ao salvar sessão:",
                        erroSalvar
                    );

                    return res.status(500).json({
                        mensagem: "Não foi possível salvar sua sessão."
                    });
                }

                return res.status(200).json({
                    mensagem: "Login realizado com sucesso!",
                    usuario: req.session.usuario
                });
            });
        });

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao realizar login."
        });
    }
}

// VERIFICAR SE ESTÁ LOGADO
export function me(req, res) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    return res.status(200).json({
        usuario: req.session.usuario
    });
}

// ENCERRAR SESSÃO
export function logout(req, res) {
    if (!req.session) {
        return res.status(200).json({
            mensagem: "Sessão encerrada."
        });
    }

    req.session.destroy((erro) => {
        if (erro) {
            console.error("Erro ao encerrar sessão:", erro);

            return res.status(500).json({
                mensagem: "Erro ao sair da conta."
            });
        }

        res.clearCookie("astroshop.sid", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        return res.status(200).json({
            mensagem: "Logout realizado com sucesso!"
        });
    });
}
