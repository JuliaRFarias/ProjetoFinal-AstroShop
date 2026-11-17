import { Router } from "express";

import * as controller from "../controllers/produtoController.js";
import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", controller.listar);
router.get("/:id", controller.buscar);

router.post("/", exigirLogin, controller.criar);
router.put("/:id", exigirLogin, controller.atualizar);
router.delete("/:id", exigirLogin, controller.excluir);

export default router;