
import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/cadastro", authController.cadastrar);
router.post("/login", authController.login);
router.get("/me", authController.me);
router.post("/logout", authController.logout);

export default router;
