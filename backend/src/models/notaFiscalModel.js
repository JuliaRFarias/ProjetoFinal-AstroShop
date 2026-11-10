
import pool from "../config/db";

export async function buscarPorCompra(idCompra) {
    const [rows] = await pool.query(
        `
        SELECT
            nf.*,
            c.nome AS cliente,
            c.email
        FROM nota_fiscal nf
        INNER JOIN cliente c
            ON c.id_cliente = nf.id_cliente
        WHERE nf.id_compra = ?
        `,
        [idCompra]
    );

    return rows[0] || null;
}

export async function listarPorCliente(idCliente) {
    const [rows] = await pool.query(
        `
        SELECT
            nf.*
        FROM nota_fiscal nf
        WHERE nf.id_cliente = ?
        ORDER BY nf.id_nota_fiscal DESC
        `,
        [idCliente]
    );

    return rows;
}
