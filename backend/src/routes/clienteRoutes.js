import { Router } from "express";

import * as controller from "../controllers/clienteController.js";
import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", exigirLogin, controller.listar);
router.get("/:id", exigirLogin, controller.buscar);
router.put("/:id", exigirLogin, controller.atualizar);
router.delete("/:id", exigirLogin, controller.excluir);

export default router;