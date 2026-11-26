
import jwt from "jsonwebtoken";

// AUTENTICAÇÃO POR TOKEN JWT
export function autenticar(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            erro: "Token de autenticação não informado."
        });
    }

    const partes = authorization.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            erro: "Formato do token inválido."
        });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurado.");
        }

        const dados = jwt.verify(
            partes[1],
            process.env.JWT_SECRET
        );

        req.usuario = dados;

        next();

    } catch (erro) {
        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });
    }
}

// VERIFICAR ADMINISTRADOR
export function somenteAdmin(req, res, next) {
    if (!req.usuario || req.usuario.tipo !== "ADMIN") {
        return res.status(403).json({
            mensagem: "Você não possui permissão para acessar esta funcionalidade."
        });
    }

    next();
}

// VALIDAR ACESSO AO PRÓPRIO CADASTRO
export function validarProprioUsuario(req, res, next) {
    const idSolicitado = Number(req.params.id);

    if (
        !req.usuario ||
        (
            req.usuario.tipo !== "ADMIN" &&
            Number(req.usuario.id_cliente) !== idSolicitado
        )
    ) {
        return res.status(403).json({
            mensagem: "Você só pode acessar seus próprios dados."
        });
    }

    next();
}

// AUTENTICAÇÃO POR SESSÃO
export function exigirLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            mensagem: "Você precisa estar logado para acessar esta funcionalidade."
        });
    }

    next();
}
