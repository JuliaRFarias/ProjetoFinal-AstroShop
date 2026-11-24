
import { Router } from "express";

import {
    buscarPorCompra,
    listarPorCliente
} from "../controllers/notaFiscalController.js";

import { exigirLogin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/cliente", exigirLogin, listarPorCliente);
router.get("/compra/:idCompra", exigirLogin, buscarPorCompra);

export default router;

