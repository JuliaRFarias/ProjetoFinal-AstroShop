import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "projetofinal-astroshop",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    supportBigNumbers: true,
    bigNumberStrings: false
});

export async function testarConexao() {
    let conexao;

    try {
        conexao = await pool.getConnection();
        await conexao.query("SELECT 1");

        console.log("Conexão com MySQL realizada com sucesso!");

        return true;
    } catch (erro) {
        console.error("Erro ao conectar ao MySQL:", erro.message);
        throw erro;
    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

export default pool;