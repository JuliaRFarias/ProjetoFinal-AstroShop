import { Router } from "express";

import * as controller from "../controllers/compraController.js";
import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

// Exige autenticação em todas as rotas
router.use(exigirLogin);

// Listar compras do cliente
router.get("/", controller.listar);

// Finalizar compra
router.post("/", controller.finalizar);

// Rota alternativa para finalizar
router.post("/finalizar", controller.finalizar);

// Buscar compra específica
router.get("/:id", controller.buscar);

// Buscar nota fiscal
router.get("/:id/nota-fiscal", controller.notaFiscal);

export default router;