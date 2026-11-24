
import { Router } from "express";

import * as controller from "../controllers/carrinhoController.js";
import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(exigirLogin);

router.get("/", controller.listar);

router.post("/itens", controller.adicionar);

router.put("/itens/:idProduto", controller.alterar);

router.delete("/itens/:idProduto", controller.remover);

router.delete("/", controller.excluir);

export default router;
