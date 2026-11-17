import { Router } from "express";

import * as controller from "../controllers/compraController.js";
import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(exigirLogin);

router.get("/", controller.listar);
router.post("/finalizar", controller.finalizar);

export default router;