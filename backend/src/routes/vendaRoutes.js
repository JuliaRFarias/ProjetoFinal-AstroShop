
import { Router } from "express";

import {
    listar,
    buscarPorId,
    atualizarStatus
} from "../controllers/vendaController.js";

import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", exigirLogin, listar);
router.get("/:id", exigirLogin, buscarPorId);
router.put("/:id/status", exigirLogin, atualizarStatus);

export default router;
