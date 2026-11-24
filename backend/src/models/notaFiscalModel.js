
import pool from "../config/db.js";

// BUSCAR NOTA FISCAL DE UMA COMPRA
export async function buscarPorCompra(idCompra) {
    const [rows] = await pool.query(
        `SELECT
            nf.*,
            v.id_compra,
            c.id_cliente,
            c.nome AS cliente,
            c.email
         FROM nota_fiscal nf
         INNER JOIN venda v
            ON v.id_venda = nf.id_venda
         INNER JOIN compra cp
            ON cp.id_compra = v.id_compra
         INNER JOIN cliente c
            ON c.id_cliente = cp.id_cliente
         WHERE v.id_compra = ?`,
        [idCompra]
    );

    return rows[0] || null;
}

// LISTAR NOTAS FISCAIS DO CLIENTE
export async function listarPorCliente(idCliente) {
    const [rows] = await pool.query(
        `SELECT
            nf.*,
            v.id_compra,
            c.nome AS cliente,
            c.email
         FROM nota_fiscal nf
         INNER JOIN venda v
            ON v.id_venda = nf.id_venda
         INNER JOIN compra cp
            ON cp.id_compra = v.id_compra
         INNER JOIN cliente c
            ON c.id_cliente = cp.id_cliente
         WHERE cp.id_cliente = ?
         ORDER BY nf.id_nota_fiscal DESC`,
        [idCliente]
    );

    return rows;
}
