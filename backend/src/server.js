const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

console.log("Senha carregada:", Boolean(process.env.DB_PASSWORD));

const app = require("./app");
const { testarConexao } = require("./config/db");
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await testarConexao();

    app.listen(PORT, () => {
      console.log("AstroShop - Backend iniciado!");
      console.log(`Servidor: http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error("Não foi possível iniciar o servidor:", erro.message);
  }
}

iniciarServidor();