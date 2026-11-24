import dotenv from "dotenv";
import app from "../src/app.js";
import { testarConexao } from "../src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await testarConexao();

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (erro) {
        console.error("Erro ao iniciar o servidor:", erro.message);
        process.exit(1);
    }
}

iniciarServidor();