
import db from "../config/db.js";

export async function buscarPorEmail(email) {
    const [resultado] = await db.query(
        `
        SELECT
            c.id_cliente,
            c.nome,
            c.cpf,
            c.email,
            c.telefone,
            c.endereco,
            l.id_login,
            l.senha_hash
        FROM cliente c
        INNER JOIN login l
            ON c.id_cliente = l.id_cliente
        WHERE c.email = ?
        AND l.ativo = TRUE
        LIMIT 1
        `,
        [email]
    );

    return resultado[0] || null;
}

export async function buscarPorId(id) {
    const [resultado] = await db.query(
        `
        SELECT
            c.id_cliente,
            c.nome,
            c.cpf,
            c.email,
            c.telefone,
            c.endereco,
            c.data_cadastro,
            ca.status AS status_cadastro
        FROM cliente c
        LEFT JOIN cadastro ca
            ON c.id_cliente = ca.id_cliente
        WHERE c.id_cliente = ?
        LIMIT 1
        `,
        [id]
    );

    return resultado[0] || null;
}

export async function listar() {
    const [resultado] = await db.query(
        `
        SELECT
            c.id_cliente,
            c.nome,
            c.cpf,
            c.email,
            c.telefone,
            c.endereco
        FROM cliente c
        INNER JOIN login l
            ON c.id_cliente = l.id_cliente
        WHERE l.ativo = TRUE
        ORDER BY c.nome
        `
    );

    return resultado;
}

export async function criar(dados) {
    const conexao = await db.getConnection();

    try {
        await conexao.beginTransaction();

        // 1. Criar cliente
        const [cliente] = await conexao.query(
            `
            INSERT INTO cliente
            (
                nome,
                cpf,
                email,
                telefone,
                endereco
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                dados.nome,
                dados.cpf || null,
                dados.email,
                dados.telefone || null,
                dados.endereco || null
            ]
        );

        const idCliente = Number(cliente.insertId);

        // 2. Criar cadastro
        await conexao.query(
            `
            INSERT INTO cadastro
            (
                id_cliente
            )
            VALUES (?)
            `,
            [idCliente]
        );

        // 3. Criar login
        await conexao.query(
            `
            INSERT INTO login
            (
                id_cliente,
                email_login,
                senha_hash
            )
            VALUES (?, ?, ?)
            `,
            [
                idCliente,
                dados.email,
                dados.senhaHash
            ]
        );

        // 4. Criar carrinho vazio
        await conexao.query(
            `
            INSERT INTO carrinho
            (
                id_cliente
            )
            VALUES (?)
            `,
            [idCliente]
        );

        await conexao.commit();

        return idCliente;

    } catch (erro) {
        await conexao.rollback();
        throw erro;

    } finally {
        conexao.release();
    }
}

export async function atualizar(id, dados) {
    const conexao = await db.getConnection();

    try {
        await conexao.beginTransaction();

        await conexao.query(
            `
            UPDATE cliente
            SET
                nome = ?,
                cpf = ?,
                telefone = ?,
                endereco = ?
            WHERE id_cliente = ?
            `,
            [
                dados.nome,
                dados.cpf || null,
                dados.telefone || null,
                dados.endereco || null,
                id
            ]
        );

        await conexao.commit();

    } catch (erro) {
        await conexao.rollback();
        throw erro;

    } finally {
        conexao.release();
    }
}

export async function desativar(id) {
    const conexao = await db.getConnection();

    try {
        await conexao.beginTransaction();

        await conexao.query(
            `
            UPDATE login
            SET ativo = FALSE
            WHERE id_cliente = ?
            `,
            [id]
        );

        await conexao.query(
            `
            UPDATE cadastro
            SET status = 'inativo'
            WHERE id_cliente = ?
            `,
            [id]
        );

        await conexao.commit();

        return {
            mensagem: "Cliente desativado com sucesso."
        };

    } catch (erro) {
        await conexao.rollback();
        throw erro;

    } finally {
        conexao.release();
    }
}
