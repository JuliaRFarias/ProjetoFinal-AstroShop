import { Router } from "express";

import {
    cadastrar,
    login,
    logout,
    me
} from "../controllers/authController.js";

const router = Router();

router.post("/cadastro", cadastrar);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);

export default router;