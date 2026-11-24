
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

// CORS
app.use(cors({
    origin: [
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    credentials: true
}));

// RECEBER JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOG DAS REQUISIÇÕES
app.use((req, res, next) => {
    console.log(`[REQUISIÇÃO] ${req.method} ${req.originalUrl}`);
    next();
});

// SESSÃO
app.use(session({
    name: "astroshop.sid",
    secret: process.env.SESSION_SECRET || "astroshop-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60
    }
}));

// ROTAS
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/notas-fiscais", notaFiscalRoutes);

// TESTE DA API
app.get("/", (req, res) => {
    res.json({
        mensagem: "API AstroShop funcionando!"
    });
});

// TESTE DE CONEXÃO
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        mensagem: "API AstroShop funcionando!"
    });
});

// ERROS
app.use((erro, req, res, next) => {
    console.error("ERRO NA API:", erro);

    res.status(500).json({
        mensagem: "Erro interno no servidor."
    });
});

export default app;
