// const express = require("express");
// const cors = require("cors");
import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import carrinhoRoutes from "./routes/carrinhoRoutes.js";
import compraRoutes from "./routes/compraRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";
import notaFiscalRoutes from "./routes/notaFiscalRoutes.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: "astroshop.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 4
    }
}));

app.get("/api/health", (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "API AstroShop funcionando!"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/notas-fiscais", notaFiscalRoutes);

app.use((req, res) => {
    res.status(404).json({
        erro: "Rota não encontrada."
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        erro: "Erro interno do servidor."
    });
});

export default app;