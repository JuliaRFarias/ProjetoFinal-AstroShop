// const express = require("express");
// const cors = require("cors");
import express from "express"
import cors from "cors"

const app = express();

const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registrar rotas
app.use("/api/auth", authRoutes);

module.exports = app;
