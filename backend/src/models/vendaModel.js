import pool from "../config/db.js";

export async function listar() {
    const [vendas] = await pool.query(
        `
        SELECT
            v.*,
            c.id_cliente,
            c.data_compra
        FROM venda v
        INNER JOIN compra c
            ON c.id_compra = v.id_compra
        ORDER BY v.id_venda DESC
        `
    );

    return vendas;
}

export async function buscarPorId(id) {
    const [rows] = await pool.query(
        `
        SELECT
            v.*,
            c.id_cliente,
            c.data_compra
        FROM venda v
        INNER JOIN compra c
            ON c.id_compra = v.id_compra
        WHERE v.id_venda = ?
        `,
        [id]
    );

    return rows[0] || null;
}

export async function atualizarStatus(id, status) {
    const [resultado] = await pool.query(
        `
        UPDATE venda
        SET status = ?
        WHERE id_venda = ?
        `,
        [status, id]
    );

    if (resultado.affectedRows === 0) {
        return null;
    }

    return buscarPorId(id);
}
