import { Router } from "express";

import * as controller from "../controllers/carrinhoController.js";
import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(exigirLogin);

router.get("/", controller.listar);
router.post("/", controller.adicionar);
router.put("/:itemId", controller.alterar);
router.delete("/:itemId", controller.remover);

export default router;