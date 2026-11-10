const pool = require("../config/db");
const clienteModel = require("../models/clienteModel");

async function cadastrar(req, res) {
  console.log("--> REQUISIÇÃO RECEBIDA NO CADASTRO <--", req.body);

  try {
    const { nome, email, telefone, senha } = req.body;

    if (!nome?.trim() || !email?.trim() || !senha || senha.length < 8) {
      return res.status(400).json({
        mensagem: "Informe nome, e-mail e senha com pelo menos 8 caracteres."
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existente = await clienteModel.buscarPorEmail(emailNormalizado);

    if (existente) {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado."
      });
    }

    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();

      const resultado = await conexao.query(
        `INSERT INTO cliente (nome, email, telefone)
         VALUES (?, ?, ?)`,
        [nome.trim(), emailNormalizado, telefone || null]
      );

      const insertIdBruto = resultado.insertId !== undefined ? resultado.insertId : (Array.isArray(resultado) ? resultado[0]?.insertId : undefined);
      const idCliente = Number(insertIdBruto);

      if (!idCliente || isNaN(idCliente)) {
        throw new Error(`Falha ao obter ID do cliente inserido.`);
      }

      // Salva a senha diretamente na coluna senha_hash
      await conexao.query(
        `INSERT INTO login (id_cliente, email_login, senha_hash)
         VALUES (?, ?, ?)`,
        [idCliente, emailNormalizado, senha]
      );

      await conexao.commit();

      res.status(201).json({
        mensagem: "Cadastro realizado com sucesso!",
        id_cliente: idCliente
      });
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "E-mail já cadastrado." });
    }

    console.error("================ ERRO NO CADASTRO ================");
    console.error(erro);
    console.error("==================================================");

    res.status(500).json({ mensagem: "Erro ao realizar cadastro." });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email?.trim() || !senha) {
      return res.status(400).json({
        mensagem: "Informe e-mail e senha."
      });
    }

    const rows = await pool.query(
      `SELECT l.id_cliente, l.email_login, l.senha_hash, c.nome
       FROM login l
       INNER JOIN cliente c ON c.id_cliente = l.id_cliente
       WHERE l.email_login = ?`,
      [email.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const usuario = rows[0];

    // Comparação simples de texto (senha enviada vs senha salva no banco)
    if (senha !== usuario.senha_hash) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    res.json({
      mensagem: "Login realizado com sucesso.",
      usuario: {
        id_cliente: usuario.id_cliente,
        nome: usuario.nome,
        email: usuario.email_login
      }
    });
  } catch (erro) {
    console.error("================ ERRO NO LOGIN ================");
    console.error(erro);
    console.error("===============================================");
    res.status(500).json({ mensagem: "Erro ao realizar login." });
  }
}

module.exports = { cadastrar, login };