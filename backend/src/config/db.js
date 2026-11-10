
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),

    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',

    database: process.env.DB_NAME || 'projeto_integrador',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    supportBigNumbers: true,
    bigNumberStrings: false
});

async function testarConexao() {
    let conexao;

    try {
        conexao = await pool.getConnection();

        await conexao.query('SELECT 1');

        console.log('Conexão com MySQL realizada com sucesso!');

        return true;

    } catch (erro) {
        console.error('Erro ao conectar ao MySQL:', erro);
        throw erro;

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

module.exports = pool;
module.exports.testarConexao = testarConexao;
