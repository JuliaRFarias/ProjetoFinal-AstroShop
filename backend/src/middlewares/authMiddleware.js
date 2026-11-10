import jwt from "jsonwebtoken";

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

    const token = partes[1];

    try {
        
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurado.");
        }

        const dados = jwt.verify(
            token,
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

export function somenteAdmin(req, res, next) {
    if (!req.usuario || req.usuario.tipo !== "ADMIN") {
        return res.status(403).json({
            erro: "Você não possui permissão para acessar esta funcionalidade."
        });
    }

    next();
}

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
            erro: "Você só pode acessar seus próprios dados."
        });
    }

    next();
}
