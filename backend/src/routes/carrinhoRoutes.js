
const express = require("express");
const controller = require("../controllers/carrinhoController");
const autenticar = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(autenticar);

router.get("/", controller.listar);
router.post("/itens", controller.adicionar);
router.put("/itens/:idProduto", controller.alterar);
router.delete("/itens/:idProduto", controller.remover);
router.delete("/", controller.excluir);

module.exports = router;
