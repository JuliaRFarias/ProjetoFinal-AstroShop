const db = require('../config/db');

async function buscarPorEmail(email) {
    const resultado = await db.query(
        `
        SELECT
            c.id_cliente,
            c.nome,
            c.email,
            c.telefone,
            l.id_login,
            l.senha_hash
        FROM cliente c
        INNER JOIN login l
            ON c.id_cliente = l.id_cliente
        WHERE c.email = ?
        LIMIT 1
        `,
        [email]
    );

    return resultado[0] || null;
}

async function buscarPorId(id) {
    const resultado = await db.query(
        `
        SELECT
            c.id_cliente,
            c.nome,
            c.email,
            c.telefone,
            ca.cpf,
            ca.cep,
            ca.rua,
            ca.numero,
            ca.complemento,
            ca.bairro,
            ca.cidade,
            ca.estado
        FROM cliente c
        LEFT JOIN cadastro ca
            ON c.id_cliente = ca.id_cliente
        WHERE c.id_cliente = ?
        `,
        [id]
    );

    return resultado[0] || null;
}

async function listar() {
    return await db.query(
        `
        SELECT
            c.id_cliente,
            c.nome,
            c.email,
            c.telefone
        FROM cliente c
        INNER JOIN login l
            ON c.id_cliente = l.id_cliente
        ORDER BY c.nome
        `
    );
}

async function criar(dados) {
    const conexao = await db.getConnection();

    try {
        await conexao.beginTransaction();

        const cliente = await conexao.query(
            `
            INSERT INTO cliente
            (
                nome,
                email,
                telefone
            )
            VALUES (?, ?, ?)
            `,
            [
                dados.nome,
                dados.email,
                dados.telefone || null
            ]
        );

        const idCliente = Number(cliente.insertId);

        await conexao.query(
            `
            INSERT INTO cadastro
            (
                id_cliente,
                cpf,
                cep,
                rua,
                numero,
                complemento,
                bairro,
                cidade,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                idCliente,
                dados.cpf || null,
                dados.cep || null,
                dados.rua || null,
                dados.numero || null,
                dados.complemento || null,
                dados.bairro || null,
                dados.cidade || null,
                dados.estado || null
            ]
        );

        await conexao.query(
            `
            INSERT INTO login
            (
                id_cliente,
                senha_hash
            )
            VALUES (?, ?)
            `,
            [
                idCliente,
                dados.senhaHash
            ]
        );

        await conexao.query(
            `
            INSERT INTO carrinho_de_compra
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

async function atualizar(id, dados) {
    const conexao = await db.getConnection();

    try {
        await conexao.beginTransaction();

        await conexao.query(
            `
            UPDATE cliente
            SET
                nome = ?,
                telefone = ?
            WHERE id_cliente = ?
            `,
            [
                dados.nome,
                dados.telefone || null,
                id
            ]
        );

        await conexao.query(
            `
            UPDATE cadastro
            SET
                cep = ?,
                rua = ?,
                numero = ?,
                complemento = ?,
                bairro = ?,
                cidade = ?,
                estado = ?
            WHERE id_cliente = ?
            `,
            [
                dados.cep || null,
                dados.rua || null,
                dados.numero || null,
                dados.complemento || null,
                dados.bairro || null,
                dados.cidade || null,
                dados.estado || null,
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

async function desativar(id) {
    return await db.query(
        `
        DELETE FROM cliente
        WHERE id_cliente = ?
        `,
        [id]
    );
}

module.exports = {
    buscarPorEmail,
    buscarPorId,
    listar,
    criar,
    atualizar,
    desativar
};