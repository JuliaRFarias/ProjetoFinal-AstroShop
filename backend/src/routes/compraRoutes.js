
const express = require("express");
const controller = require("../controllers/compraController");
const autenticar = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(autenticar);

router.get("/", controller.listar);
router.get("/:id/nota-fiscal", controller.notaFiscal);
router.get("/:id", controller.buscar);
router.post("/", controller.finalizar);

module.exports = router;
